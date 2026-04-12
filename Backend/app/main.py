from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import plant, groq
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="LeafDoctor Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plant.router, prefix="/api", tags=["Plant"])
app.include_router(groq.router, prefix="/api", tags=["Groq"])

@app.get("/")
def root():
    return {"message": "✅ LeafDoctor Backend Running"}

@app.get("/health")
def health():
    return {"status": "ok"}