import os
import time
import logging
import json
import re
from twelvelabs import TwelveLabs
from twelvelabs.indexes import IndexesCreateRequestModelsItem

# Basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# TwelveLabs client
api_key = os.getenv("TL_API_KEY")
if not api_key:
    raise RuntimeError("TL_API_KEY not set")
client = TwelveLabs(api_key=api_key)

INDEX_NAME = "sbhacks_generate_v1"


def get_or_create_index() -> str:
    """
    Return an existing generate-capable index or create one.
    """
    # 1) Look for our specific index by name
    try:
        indexes = list(client.indexes.list(page_limit=50))
        for idx in indexes:
            if idx.index_name == INDEX_NAME:
                logger.info(f"[INDEX] Found existing index: {idx.id} ({INDEX_NAME})")
                return idx.id
    except Exception as e:
        logger.warning(f"[INDEX] Listing indexes failed: {e}")

    # 2) Create a new generate-capable index (pegasus1.2)
    logger.info(f"[INDEX] Creating new index {INDEX_NAME} with pegasus1.2")
    try:
        target_index = client.indexes.create(
            index_name=INDEX_NAME,
            models=[
                IndexesCreateRequestModelsItem(
                    model_name="pegasus1.2",
                    model_options=["visual", "audio"],
                )
            ],
        )
        logger.info(f"[INDEX] Created index: {target_index.id}")
        return target_index.id
    except TypeError as e:
        logger.warning(f"[INDEX] Retrying with 'name' param: {e}")
        target_index = client.indexes.create(
            name=INDEX_NAME,
            models=[
                IndexesCreateRequestModelsItem(
                    model_name="pegasus1.2",
                    model_options=["visual", "audio"],
                )
            ],
        )
        logger.info(f"[INDEX] Created index (fallback): {target_index.id}")
        return target_index.id


def upload_video_file(file_path: str) -> str:
    """
    Upload a local file to TwelveLabs and return the video_id.
    """
    if not os.path.exists(file_path):
        raise RuntimeError(f"File path does not exist: {file_path}")

    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if file_size_mb <= 0:
        raise RuntimeError("File is empty; cannot upload to TwelveLabs.")

    index_id = get_or_create_index()
    # SDK expects video_file (not file)
    task = client.tasks.create(index_id=index_id, video_file=file_path)
    logger.info(f"[UPLOAD] Task created: {task.id}")

    # Poll until ready/failed
    while True:
        task_status = client.tasks.retrieve(task.id)
        logger.info(f"[UPLOAD] Status: {task_status.status}")
        if task_status.status == "ready":
            return task_status.video_id
        if task_status.status == "failed":
            raise RuntimeError("Video processing failed")
        time.sleep(2)


def upload_video_url(video_url: str) -> str:
    """
    Upload a remote video URL to TwelveLabs and return the video_id.
    """
    if not video_url:
        raise RuntimeError("video_url is required")

    index_id = get_or_create_index()
    task = client.tasks.create(index_id=index_id, video_url=video_url)
    logger.info(f"[UPLOAD_URL] Task created: {task.id} for {video_url}")

    while True:
        task_status = client.tasks.retrieve(task.id)
        logger.info(f"[UPLOAD_URL] Status: {task_status.status}")
        if task_status.status == "ready":
            return task_status.video_id
        if task_status.status == "failed":
            raise RuntimeError("Video processing failed")
        time.sleep(2)


def generate_quiz(video_id: str) -> list:
    """
    Generate structured quiz questions based on the video content.
    Returns a list of question objects with options and correct answer.
    """
    quiz_prompt = """Based on this video content, generate exactly 5 multiple choice questions.
    
    Return ONLY a valid JSON array with this exact format, no other text:
    [
        {
            "question": "What is the main topic discussed?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0
        }
    ]
    
    Rules:
    - Each question must have exactly 4 options
    - correctAnswer is the index (0-3) of the correct option
    - Questions should test comprehension of the video content
    - Return ONLY the JSON array, no markdown or extra text"""
    
    res = client.summarize(
        video_id=video_id,
        type="summary",
        prompt=quiz_prompt,
    )
    
    # Parse the JSON response
    try:
        # Try to extract JSON from the response
        response_text = res.summary.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = re.sub(r'^```(?:json)?\n?', '', response_text)
            response_text = re.sub(r'\n?```$', '', response_text)
        
        quiz_data = json.loads(response_text)
        
        # Validate structure
        if isinstance(quiz_data, list) and len(quiz_data) > 0:
            return quiz_data
    except (json.JSONDecodeError, Exception) as e:
        logger.warning(f"[QUIZ] Failed to parse quiz JSON: {e}")
    
    # Fallback: return a default quiz structure
    return [
        {
            "question": "What was the main topic of this video?",
            "options": ["Topic A", "Topic B", "Topic C", "Topic D"],
            "correctAnswer": 0
        }
    ]


def generate_gist(video_id: str) -> dict:
    """
    Generate title, topics, hashtags.
    """
    res = client.gist(video_id=video_id, types=["title", "topic", "hashtag"])
    return {"title": res.title, "topics": res.topics, "hashtags": res.hashtags}


def generate_feedback(video_id: str, correct_answers: list, wrong_answers: list) -> dict:
    """
    Generate personalized feedback based on quiz performance.
    Analyzes language concepts the user understands and needs to improve.
    """
    feedback_prompt = f"""Based on this language learning video and the user's quiz results, provide personalized feedback.

QUESTIONS ANSWERED CORRECTLY (concepts they understand well):
{json.dumps(correct_answers, indent=2)}

QUESTIONS ANSWERED INCORRECTLY (concepts they struggled with):
{json.dumps(wrong_answers, indent=2)}

Analyze the video content and the quiz results to provide feedback. Return ONLY valid JSON with this exact format:
{{
    "strengths": ["List 2-3 specific language concepts or skills they demonstrated understanding of based on correct answers"],
    "areas_to_improve": ["List 2-3 specific language concepts they need to practice based on wrong answers"],
    "tips": ["Provide 2-3 actionable tips referencing specific parts of the video to help them improve"],
    "encouragement": "A brief encouraging message about their progress"
}}

Rules:
- Be specific about language concepts (vocabulary, grammar, pronunciation, comprehension, etc.)
- Reference actual content from the video in your tips
- If they got everything correct, focus on reinforcing their strengths
- If they got everything wrong, be extra encouraging
- Return ONLY the JSON object, no markdown or extra text"""

    res = client.summarize(
        video_id=video_id,
        type="summary",
        prompt=feedback_prompt,
    )
    
    try:
        response_text = res.summary.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = re.sub(r'^```(?:json)?\n?', '', response_text)
            response_text = re.sub(r'\n?```$', '', response_text)
        
        feedback_data = json.loads(response_text)
        
        # Validate structure
        if isinstance(feedback_data, dict) and "strengths" in feedback_data:
            return feedback_data
    except (json.JSONDecodeError, Exception) as e:
        logger.warning(f"[FEEDBACK] Failed to parse feedback JSON: {e}")
    
    # Fallback response
    return {
        "strengths": ["You completed the quiz!"],
        "areas_to_improve": ["Keep practicing with more videos"],
        "tips": ["Try rewatching the video and paying attention to key vocabulary"],
        "encouragement": "Great effort! Every quiz helps you learn."
    }
