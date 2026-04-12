from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

class TipsRequest(BaseModel):
    plantName: str
    scientificName: str

@router.post("/tips")
async def get_care_tips(body: TipsRequest):
    """
    Receives plant name from frontend, calls Groq API, returns 4 care tips.
    """
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    prompt = (
        f'Give exactly 4 care tips for "{body.plantName}" ({body.scientificName}).\n'
        f"Format each tip exactly like this:\n"
        f"1. Watering: [tip here]\n"
        f"2. Sunlight: [tip here]\n"
        f"3. Disease Watch: [tip here]\n"
        f"4. Fertilizing: [tip here]\n"
        f"Keep each tip under 20 words. No extra text."
    )

    try:
        response = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama3-8b-8192",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 300,
                "temperature": 0.5,
            },
            timeout=20,
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        content = response.json()["choices"][0]["message"]["content"]
        return {"tips": content}

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Groq API timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))