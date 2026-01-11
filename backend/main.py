import os
from pathlib import Path
import shutil
import logging
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# Load env from backend/.env (relative to this file's location)
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
from services import (
    upload_video_file,
    upload_video_url,
    generate_quiz,
    generate_gist,
    generate_feedback,
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
    return {"message": "Language Learning Quiz Backend"}


@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """
    Upload a video file, index it with TwelveLabs, then return quiz + gist.
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

        # Generate quiz
        quiz = generate_quiz(video_id)

        # Generate gist (title, topics, hashtags)
        gist = generate_gist(video_id)

        logger.info(f"[API] /upload completed in {(datetime.now() - start).total_seconds():.2f}s")

        return {
            "video_id": video_id,
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
async def upload_video_url_endpoint(url: str = Form(...)):
    """
    Accept a public video URL (e.g., Supabase signed URL), send to TwelveLabs via video_url.
    Returns quiz + gist.
    """
    start = datetime.now()
    try:
        if not url.strip():
            raise HTTPException(status_code=400, detail="URL is required.")

        # Upload via video_url
        video_id = upload_video_url(url.strip())

        # Generate quiz
        quiz = generate_quiz(video_id)

        # Gist
        gist = generate_gist(video_id)

        logger.info(f"[API] /upload-url completed in {(datetime.now() - start).total_seconds():.2f}s")

        return {
            "video_id": video_id,
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


class QuizAnswer(BaseModel):
    question: str
    userAnswer: str
    correctAnswer: str


class FeedbackRequest(BaseModel):
    video_id: str
    correct_answers: List[QuizAnswer]
    wrong_answers: List[QuizAnswer]


@app.post("/feedback")
async def get_feedback(request: FeedbackRequest):
    """
    Generate personalized feedback based on quiz performance.
    Analyzes language concepts the user understands and needs to improve.
    """
    start = datetime.now()
    try:
        # Convert to simple dicts for the prompt
        correct = [{"question": a.question, "userAnswer": a.userAnswer} for a in request.correct_answers]
        wrong = [{"question": a.question, "userAnswer": a.userAnswer, "correctAnswer": a.correctAnswer} for a in request.wrong_answers]
        
        feedback = generate_feedback(request.video_id, correct, wrong)
        
        logger.info(f"[API] /feedback completed in {(datetime.now() - start).total_seconds():.2f}s")
        
        return feedback
    except Exception as e:
        logger.error(f"[API] /feedback failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
