from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import story

app = FastAPI(title="StoryVerse API")

# 1. We list the exact URLs allowed to talk to your backend.
# You cannot use "*" when allow_credentials=True.
origins = [
    "https://comicbloom.web.app", # Your live Firebase frontend
    "http://localhost:5173",      # Standard Vite local port for testing
    "http://127.0.0.1:5173",      # Standard Vite local IP for testing
    "http://localhost:3000",      # Alternative local port
]

# 2. We add the CORS middleware using the exact origins list above.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Your story router
app.include_router(story.router, prefix="/api/story")

# 4. Root endpoint
@app.get("/")
def root():
    return {"message": "StoryVerse API is running"}