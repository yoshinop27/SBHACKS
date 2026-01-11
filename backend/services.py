import os
from twelvelabs import TwelveLabs

import yt_dlp
import uuid
from typing import List, Optional

# Initialize TwelveLabs client
# Ensure TL_API_KEY is set in your environment variables or .env file
api_key = os.getenv("TL_API_KEY")
if not api_key:
    print("CRITICAL WARNING: TL_API_KEY is not set in environment variables!")
else:
    print(f"TL_API_KEY loaded. Length: {len(api_key)}")

client = TwelveLabs(api_key=api_key)

# You might need a persistent index for this demo or create one dynamically.
# For simplicity, we can check for an existing index or create a new one.
INDEX_NAME = "sbhacks_demo_index"

def get_or_create_index():
    try:
        print("Listing indexes...")
        indexes = client.indexes.list(page_limit=50) 
        target_index = None
        
        # Determine if 'indexes' is a list or a pager object
        # The SDK usually returns a generator/pager
        for index in indexes:
            if index.name == INDEX_NAME:
                target_index = index
                break
                
        if not target_index:
            print(f"Index {INDEX_NAME} not found, creating...")
            # Ensure engines are valid for the specific plan/region
            # providing both marengo and pegasus might require a specific tier
            # We'll try a simpler configuration if this fails, but for now:
            target_index = client.indexes.create(
                name=INDEX_NAME,
                engines=[
                    {
                        "name": "marengo2.6", # Updated to use newer version if possible, or stick to 2.6
                        "options": ["visual", "conversation", "text_in_video"]
                    },
                     {
                        "name": "pegasus1.1", # Updated to pegasus 1.1 if available
                        "options": ["visual", "conversation"]
                    }
                ]
            )
            print(f"Created index: {target_index.id}")
        else:
            print(f"Found index: {target_index.id}")
            
        return target_index.id
    except Exception as e:
        print(f"Error in get_or_create_index: {e}")
        # Re-raise so upper layers catch it
        raise e

def upload_video_file(file_path: str) -> str:
    """
    Uploads a local file to the TwelveLabs index.
    Returns the video_id.
    """
    try:
        index_id = get_or_create_index()
        print(f"Uploading {file_path} to index {index_id}...")
        
        # Check if file exists
        if not os.path.exists(file_path):
             raise Exception(f"File path does not exist: {file_path}")

        task = client.tasks.create(
            index_id=index_id,
            file=file_path
        )
        
        print(f"Task created: {task.id}")
        
        import time
        while True:
            task_status = client.tasks.retrieve(task.id)
            print(f"Task Status: {task_status.status}")
            if task_status.status == "ready":
                return task_status.video_id
            elif task_status.status == "failed":
                raise Exception(f"Video processing failed: {task_status.process.message}")
            time.sleep(2)
    except Exception as e:
        print(f"Error in upload_video_file: {e}")
        raise e

def download_youtube_video(url: str, output_dir: str = "downloads") -> str:
    """
    Downloads a YouTube video using yt-dlp.
    Returns the path to the downloaded file.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    filename_id = str(uuid.uuid4())
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': f'{output_dir}/{filename_id}.%(ext)s',
        'noplaylist': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        # The filename might change due to extension, so we need to find it
        # Or simpler: just list dir for the uuid
        
        # ydl.prepare_filename(info) gives the expected filename
        filename = ydl.prepare_filename(info)
        return filename

def generate_summary(video_id: str, prompt: str = "Provide a detailed summary of this video.") -> str:
    """
    Generates a summary for the given video_id using TwelveLabs Generate API.
    """
    print(f"Generating summary for {video_id}...")
    
    # Using the 'summarize' method or 'generate' depending on exact SDK version features
    # Based on docs: client.generate.text or similar. 
    # Checking doc provided: client.generate.summarize is available?
    # The doc says `client.summarize(...)` 
    
    res = client.summarize(
        video_id=video_id,
        type="summary",
        prompt=prompt
    )
    
    return res.summary

def generate_gist(video_id: str) -> dict:
     res = client.gist(
        video_id=video_id,
        types=["title", "topic", "hashtag"]
    )
     return {
         "title": res.title,
         "topics": res.topics,
         "hashtags": res.hashtags
     }
