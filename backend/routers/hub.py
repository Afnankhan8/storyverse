from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime
import uuid
from database import db
from google.cloud import firestore

router = APIRouter()

# Schema for incoming Book
class PageSchema(BaseModel):
    panel_number: int
    speaker_1: Optional[str] = ""
    line_1: Optional[str] = ""
    speaker_2: Optional[str] = ""
    line_2: Optional[str] = ""
    action: str
    image_url: str

class PublishRequest(BaseModel):
    title: str
    author: str
    authorId: str
    pages: List[PageSchema]
    coverImage: str
    status: str = "pending"
    genre: Optional[str] = "adventure"
    description: Optional[str] = ""
    audience: Optional[str] = "everyone"
    language: Optional[str] = "english"
    tags: Optional[List[str]] = []
    warnings: Optional[List[str]] = []
    
class EditRequest(BaseModel):
    title: Optional[str] = None
    pages: Optional[List[PageSchema]] = None
    coverImage: Optional[str] = None
    status: Optional[str] = None
    authorId: str # To verify ownership

@router.post("/publish")
async def publish_book(request: PublishRequest):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    book_id = str(uuid.uuid4())
    now = firestore.SERVER_TIMESTAMP
    
    book_data = {
        "id": book_id,
        "title": request.title,
        "author": request.author,
        "authorId": request.authorId,
        "pages": [p.dict() for p in request.pages],
        "coverImage": request.coverImage,
        "status": request.status,
        "genre": request.genre or "adventure",
        "description": request.description or "",
        "audience": request.audience or "everyone",
        "language": request.language or "english",
        "tags": request.tags or [],
        "warnings": request.warnings or [],
        "isPublished": request.status == "published",
        "likes": 0,
        "views": 0,
        "ratingTotal": 0,
        "ratingCount": 0,
        "avgRating": 0,
        "createdAt": now,
        "updatedAt": now
    }
    
    db.collection("published_books").document(book_id).set(book_data)
    
    return {"message": "Published successfully", "id": book_id, "url": f"/book/{book_id}"}

@router.get("/book/{id}")
async def get_book(id: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    doc = db.collection("published_books").document(id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Book not found")
        
    return doc.to_dict()

@router.put("/book/{id}")
async def update_book(id: str, request: EditRequest):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    doc_ref = db.collection("published_books").document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Book not found")
        
    data = doc.to_dict()
    
    # Security check
    if data.get("authorId") != request.authorId:
        raise HTTPException(status_code=403, detail="Not authorized to edit this book")
        
    update_data = {"updatedAt": firestore.SERVER_TIMESTAMP}
    
    if request.title is not None:
        update_data["title"] = request.title
    if request.pages is not None:
        update_data["pages"] = [p.dict() for p in request.pages]
    if request.coverImage is not None:
        update_data["coverImage"] = request.coverImage
    if request.status is not None:
        update_data["status"] = request.status
        if request.status == "published":
            update_data["isPublished"] = True
            
    doc_ref.update(update_data)
    
    return {"message": "Book updated successfully"}

@router.get("/hub")
async def get_hub_feed():
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    # Fetch all published books (single-field where = no composite index needed)
    # Sort in Python to avoid Firestore composite index requirement
    docs = db.collection("published_books")\
             .where(filter=firestore.FieldFilter("isPublished", "==", True))\
             .limit(100)\
             .stream()
             
    books = [doc.to_dict() for doc in docs]
    
    # Sort by createdAt descending in Python
    def get_ts(b):
        ts = b.get("createdAt")
        if ts and hasattr(ts, "timestamp"):
            return ts.timestamp()
        return 0
    books.sort(key=get_ts, reverse=True)
    books = books[:50]
        
    return {"books": books}

@router.get("/books")
async def list_books(authorId: Optional[str] = None):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    query = db.collection("published_books")
    if authorId:
        docs = query.where(filter=firestore.FieldFilter("authorId", "==", authorId)).stream()
    else:
        docs = query.stream()
        
    books = [doc.to_dict() for doc in docs]
    
    # Sort by createdAt descending in Python
    def get_ts(b):
        ts = b.get("createdAt")
        if ts and hasattr(ts, "timestamp"):
            return ts.timestamp()
        return 0
    books.sort(key=get_ts, reverse=True)
    
    return {"books": books}

@router.get("/user/{username}")
async def get_user_books(username: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    docs = db.collection("published_books")\
             .where(filter=firestore.FieldFilter("author", "==", username))\
             .stream()
             
    books = [doc.to_dict() for doc in docs]
    
    # Sort by createdAt descending in Python (avoids composite index)
    def get_ts(b):
        ts = b.get("createdAt")
        if ts and hasattr(ts, "timestamp"):
            return ts.timestamp()
        return 0
    books.sort(key=get_ts, reverse=True)
        
    return {"books": books}

@router.post("/view/{id}")
async def increment_view(id: str):
    if not db:
        return {"status": "ok", "message": "Database not initialized"}
        
    doc_ref = db.collection("published_books").document(id)
    doc_ref.update({"views": firestore.Increment(1)})
    return {"message": "View incremented"}

@router.post("/like/{id}")
async def increment_like(id: str):
    if not db:
        return {"status": "ok", "message": "Database not initialized"}
        
    doc_ref = db.collection("published_books").document(id)
    doc_ref.update({"likes": firestore.Increment(1)})
    return {"message": "Like incremented"}
