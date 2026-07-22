import requests
import sys
import os

try:
    with open("C:/Windows/Web/Wallpaper/Windows/img0.jpg", "rb") as f:
        files = {"file": ("test.jpg", f, "image/jpeg")}
        resp = requests.post("http://127.0.0.1:8000/extract", files=files)
        print(f"Status: {resp.status_code}")
        vision_model = os.environ.get('VISION_MODEL_NAME', 'gemini-1.5-flash')
    print(f'Using model: {vision_model}')
except Exception as e:
    print(f"Error reading local file: {e}")
