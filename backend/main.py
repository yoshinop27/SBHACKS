import os
import shutil
import logging
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Load env before importing services (so TL_API_KEY is available)
load_dotenv()
from services import (
    upload_video_file,
    upload_video_url,
    generate_summary,
    generate_quiz,
    generate_gist,
)

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS (open for simplicity; tighten in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "TwelveLabs Video Summarizer Backend"}


@app.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    instructions: str = Form(default="Provide a concise summary of this video."),
):
    """
    Upload a video file, index it with TwelveLabs, then return summary + gist.
    """
    temp_file = f"temp_{file.filename}"
    start = datetime.now()

    try:
        # Save uploaded file to disk
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Basic validation to avoid broken uploads
        size_mb = os.path.getsize(temp_file) / (1024 * 1024)
        if size_mb <= 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Upload to TwelveLabs
        video_id = upload_video_file(temp_file)

        # Generate summary (with optional instructions)
        prompt = instructions.strip() or "Provide a concise summary of this video."
        summary = generate_summary(video_id, prompt=prompt)

        # Generate quiz
        prompt = instructions.strip() or "Generate a quiz for the video."
        quiz = generate_quiz(video_id, prompt=prompt)

        # Generate gist (title, topics, hashtags)
        gist = generate_gist(video_id)

        logger.info(f"[API] /upload completed in {(datetime.now() - start).total_seconds():.2f}s")

        return {
            "video_id": video_id,
            "summary": summary,
            "quiz": quiz,
            "title": gist.get("title"),
            "topics": gist.get("topics"),
            "hashtags": gist.get("hashtags"),
        }
    except Exception as e:
        logger.error(f"[API] /upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


@app.post("/upload-url")
async def upload_video_url_endpoint(
    url: str = Form(...),
    instructions: str = Form(default="Provide a concise summary of this video."),
):
    """
    Accept a public video URL (e.g., Supabase signed URL), send to TwelveLabs via video_url.
    """
    start = datetime.now()
    try:
        if not url.strip():
            raise HTTPException(status_code=400, detail="URL is required.")

        # Upload via video_url
        video_id = upload_video_url(url.strip())

        # Generate summary
        prompt = instructions.strip() or "Provide a concise summary of this video."
        summary = generate_summary(video_id, prompt=prompt)

        # Generate quiz
        prompt = instructions.strip() or "Generate a quiz for the video."
        quiz = generate_quiz(video_id, prompt=prompt)

        # Gist
        gist = generate_gist(video_id)

        logger.info(f"[API] /upload-url completed in {(datetime.now() - start).total_seconds():.2f}s")

        return {
            "video_id": video_id,
            "summary": summary,
            "quiz": quiz,
            "title": gist.get("title"),
            "topics": gist.get("topics"),
            "hashtags": gist.get("hashtags"),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[API] /upload-url failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
