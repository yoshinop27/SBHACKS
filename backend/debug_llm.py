import os
import httpx
import json
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")
print("Environment keys:", [k for k in os.environ.keys() if "KEY" in k or "TOKEN" in k])

api_key = os.getenv("OPENROUTER_API_KEY")

prompt = "Create a 1-day study plan for Italian. Return valid JSON."

try:
    print("Sending request...")
    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "google/gemini-pro-1.5", 
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=60.0
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
