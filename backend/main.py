from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Message
from detector import detect_scam

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "project":"SurakshaAI",
        "status":"Backend Running Successfully 🚀"
    }

@app.post("/detect")
def analyze(message:Message):

    return detect_scam(message.text)