from fastapi import APIRouter, UploadFile, File, HTTPException
import requests
import os

router = APIRouter()

PLANTNET_API_KEY = os.getenv("PLANTNET_API_KEY")
PLANTNET_URL = "https://my-api.plantnet.org/v2/identify/all"

@router.post("/identify")
async def identify_plant(image: UploadFile = File(...)):
    """
    Receives image from frontend, calls PlantNet API, returns result.
    """
    if not PLANTNET_API_KEY:
        raise HTTPException(status_code=500, detail="PlantNet API key not configured")

    try:
        image_bytes = await image.read()

        response = requests.post(
            PLANTNET_URL,
            params={"api-key": PLANTNET_API_KEY, "lang": "en"},
            files={"images": (image.filename, image_bytes, image.content_type)},
            data={"organs": ["leaf"]},
            timeout=30,
        )

        if response.status_code == 404:
            return {"notAPlant": True, "message": "No plant identified"}

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        data = response.json()
        results = data.get("results", [])

        if not results:
            return {"notAPlant": True, "message": "No plant identified"}

        top = results[0]
        species = top.get("species", {})

        return {
            "notAPlant": False,
            "plantName": species.get("commonNames", [species.get("scientificNameWithoutAuthor", "Unknown")])[0],
            "scientificName": species.get("scientificNameWithoutAuthor", ""),
            "confidence": round(top.get("score", 0) * 100, 1),
            "family": species.get("family", {}).get("scientificNameWithoutAuthor", ""),
            "allResults": [
                {
                    "plantName": r.get("species", {}).get("commonNames", ["Unknown"])[0] if r.get("species", {}).get("commonNames") else r.get("species", {}).get("scientificNameWithoutAuthor", "Unknown"),
                    "scientificName": r.get("species", {}).get("scientificNameWithoutAuthor", ""),
                    "confidence": round(r.get("score", 0) * 100, 1),
                }
                for r in results[:3]
            ]
        }

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="PlantNet API timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))