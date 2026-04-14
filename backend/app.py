from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import story

app = FastAPI(title="StoryVerse API")

# Allowed frontend origins
origins = [
    "https://comixnova.onrender.com",
    "https://comicbloom.web.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(story.router, prefix="/api/story")

# Root endpoint
@app.get("/")
def root():
    return {"message": "StoryVerse API is running"}