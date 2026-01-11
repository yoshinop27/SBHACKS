from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
from services import upload_video_file, download_youtube_video, generate_summary, generate_gist
from deep_translator import GoogleTranslator

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon, allow all. In prod, specify domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class YouTubeURL(BaseModel):
    url: str

class TranslationRequest(BaseModel):
    text: str
    target_language: str

@app.get("/")
def read_root():
    return {"message": "TwelveLabs Video Summarizer Backend"}

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        video_id = upload_video_file(temp_file)
        
        # Generate summary immediately for simplicity
        summary = generate_summary(video_id)
        gist = generate_gist(video_id)
        
        return {
            "video_id": video_id,
            "summary": summary,
            "title": gist.get("title"),
            "topics": gist.get("topics"),
            "hashtags": gist.get("hashtags")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.post("/upload-url")
async def upload_url(item: YouTubeURL):
    try:
        file_path = download_youtube_video(item.url)
        video_id = upload_video_file(file_path)
        
        summary = generate_summary(video_id)
        gist = generate_gist(video_id)
        
        # Cleanup downloaded file
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return {
            "video_id": video_id,
            "summary": summary,
            "title": gist.get("title"),
            "topics": gist.get("topics"),
            "hashtags": gist.get("hashtags")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/translate")
async def translate_text(request: TranslationRequest):
    try:
        # Use deep_translator
        translated = GoogleTranslator(source='auto', target=request.target_language).translate(request.text)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

# Add a cleanup cron/startup task if needed to clear old temp files
