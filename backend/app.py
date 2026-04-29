from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import story, payment, hub, social
from fastapi.responses import StreamingResponse
import requests

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
app.include_router(payment.router, prefix="/api/payment")
app.include_router(hub.router, prefix="/api/hub")
app.include_router(social.router, prefix="/api/social")

# Root endpoint
@app.get("/")
def root():
    return {"message": "StoryVerse API is running"}



@app.get("/proxy-pdf")
def proxy_pdf(url: str):
    print(f"Proxying PDF request for: {url}")
    try:
        r = requests.get(url, stream=True, timeout=30)
        
        if r.status_code != 200:
            print(f"Error: Backend returned {r.status_code} for {url}")
            return StreamingResponse(
                iter([f"Error: Source returned {r.status_code}".encode()]),
                status_code=r.status_code,
                media_type="text/plain"
            )

        content_type = r.headers.get("content-type", "").lower()
        print(f"Content-Type: {content_type}")

        # Be lenient with content types
        # if "pdf" not in content_type and "application/octet-stream" not in content_type:
        #    print(f"Warning: Unexpected content type {content_type}")

        return StreamingResponse(
            r.iter_content(chunk_size=8192),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "inline; filename=file.pdf",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache"
            }
        )
    except Exception as e:
        print(f"Proxy Exception: {str(e)}")
        return StreamingResponse(
            iter([f"Proxy Error: {str(e)}".encode()]),
            status_code=500,
            media_type="text/plain"
        )

import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)