import os
import time
import logging
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


def generate_summary(video_id: str, prompt: str) -> str:
    """
    Generate a summary with an optional prompt/instructions.
    """
    res = client.summarize(
        video_id=video_id,
        type="summary",
        prompt=prompt,
    )
    return res.summary


def generate_gist(video_id: str) -> dict:
    """
    Generate title, topics, hashtags.
    """
    res = client.gist(video_id=video_id, types=["title", "topic", "hashtag"])
    return {"title": res.title, "topics": res.topics, "hashtags": res.hashtags}
