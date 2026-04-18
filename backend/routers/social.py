from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime
import uuid
from database import db
from google.cloud import firestore

router = APIRouter()


# ─── SCHEMAS ────────────────────────────────────────────────────────────────

class CommentRequest(BaseModel):
    bookId: str
    userId: str
    username: str
    text: str
    rating: Optional[int] = None  # 1-5

class BookshelfRequest(BaseModel):
    userId: str
    bookId: str
    bookTitle: str
    coverImage: Optional[str] = ""
    author: str

class FollowRequest(BaseModel):
    followerId: str
    followerName: str
    targetUsername: str  # The creator to follow


# ─── COMMENTS ────────────────────────────────────────────────────────────────

@router.post("/comment")
async def add_comment(request: CommentRequest):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")

    comment_id = str(uuid.uuid4())
    comment_data = {
        "id": comment_id,
        "bookId": request.bookId,
        "userId": request.userId,
        "username": request.username,
        "text": request.text,
        "rating": request.rating,
        "createdAt": firestore.SERVER_TIMESTAMP,
    }
    db.collection("comments").document(comment_id).set(comment_data)

    # Update book average rating if rating given
    if request.rating:
        book_ref = db.collection("published_books").document(request.bookId)
        book = book_ref.get()
        if book.exists:
            data = book.to_dict()
            old_total = data.get("ratingTotal", 0)
            old_count = data.get("ratingCount", 0)
            new_total = old_total + request.rating
            new_count = old_count + 1
            book_ref.update({
                "ratingTotal": new_total,
                "ratingCount": new_count,
                "avgRating": round(new_total / new_count, 1)
            })

    return {"message": "Comment added", "id": comment_id}


@router.get("/comments/{book_id}")
async def get_comments(book_id: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")

    docs = db.collection("comments")\
             .where("bookId", "==", book_id)\
             .order_by("createdAt", direction=firestore.Query.DESCENDING)\
             .limit(50)\
             .stream()

    comments = []
    for doc in docs:
        data = doc.to_dict()
        # Convert Firestore timestamp to string
        if data.get("createdAt") and hasattr(data["createdAt"], "isoformat"):
            data["createdAt"] = data["createdAt"].isoformat()
        comments.append(data)

    return {"comments": comments}


@router.delete("/comment/{comment_id}")
async def delete_comment(comment_id: str, userId: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")

    doc_ref = db.collection("comments").document(comment_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Comment not found")

    data = doc.to_dict()
    if data.get("userId") != userId:
        raise HTTPException(status_code=403, detail="Not authorized")

    doc_ref.delete()
    return {"message": "Comment deleted"}


# ─── BOOKSHELF ────────────────────────────────────────────────────────────────

@router.post("/bookshelf/save")
async def save_to_bookshelf(request: BookshelfRequest):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")

    shelf_ref = db.collection("bookshelves")\
                  .document(request.userId)\
                  .collection("saved")\
                  .document(request.bookId)

    shelf_ref.set({
        "bookId": request.bookId,
        "bookTitle": request.bookTitle,
        "coverImage": request.coverImage,
        "author": request.author,
        "savedAt": firestore.SERVER_TIMESTAMP,
    })
    return {"message": "Saved to bookshelf"}


@router.delete("/bookshelf/remove")
async def remove_from_bookshelf(userId: str, bookId: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")

    db.collection("bookshelves").document(userId).collection("saved").document(bookId).delete()
    return {"message": "Removed from bookshelf"}


@router.get("/bookshelf/{user_id}")
async def get_bookshelf(user_id: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")

    docs = db.collection("bookshelves")\
             .document(user_id)\
             .collection("saved")\
             .order_by("savedAt", direction=firestore.Query.DESCENDING)\
             .stream()

    saved = []
    for doc in docs:
        data = doc.to_dict()
        if data.get("savedAt") and hasattr(data["savedAt"], "isoformat"):
            data["savedAt"] = data["savedAt"].isoformat()
        saved.append(data)

    return {"saved": saved}


@router.get("/bookshelf/{user_id}/check/{book_id}")
async def check_bookshelf(user_id: str, book_id: str):
    if not db:
        return {"saved": False}

    doc = db.collection("bookshelves").document(user_id).collection("saved").document(book_id).get()
    return {"saved": doc.exists}


# ─── FOLLOW / UNFOLLOW ───────────────────────────────────────────────────────

@router.post("/follow")
async def follow_creator(request: FollowRequest):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")

    follow_ref = db.collection("follows")\
                   .document(request.targetUsername)\
                   .collection("followers")\
                   .document(request.followerId)

    follow_ref.set({
        "followerId": request.followerId,
        "followerName": request.followerName,
        "followedAt": firestore.SERVER_TIMESTAMP,
    })

    # Add to the follower's following list
    db.collection("following")\
      .document(request.followerId)\
      .collection("creators")\
      .document(request.targetUsername)\
      .set({
          "username": request.targetUsername,
          "followedAt": firestore.SERVER_TIMESTAMP,
      })

    return {"message": f"Now following {request.targetUsername}"}


@router.delete("/follow")
async def unfollow_creator(followerId: str, targetUsername: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")

    db.collection("follows").document(targetUsername).collection("followers").document(followerId).delete()
    db.collection("following").document(followerId).collection("creators").document(targetUsername).delete()
    return {"message": f"Unfollowed {targetUsername}"}


@router.get("/follow/{username}/count")
async def get_follower_count(username: str):
    if not db:
        return {"count": 0, "followers": []}

    docs = db.collection("follows").document(username).collection("followers").stream()
    followers = [doc.to_dict() for doc in docs]
    return {"count": len(followers), "followers": followers}


@router.get("/follow/{follower_id}/check/{username}")
async def check_following(follower_id: str, username: str):
    if not db:
        return {"following": False}

    doc = db.collection("follows").document(username).collection("followers").document(follower_id).get()
    return {"following": doc.exists}


# ─── ANALYTICS ───────────────────────────────────────────────────────────────

@router.get("/analytics/{author_id}")
async def get_creator_analytics(author_id: str):
    """Get analytics for all published books by an author."""
    if not db:
        return {"totalViews": 0, "totalLikes": 0, "totalBooks": 0, "books": []}

    docs = db.collection("published_books")\
             .where("authorId", "==", author_id)\
             .stream()

    books = []
    total_views = 0
    total_likes = 0
    total_comments = 0

    for doc in docs:
        data = doc.to_dict()
        views = data.get("views", 0)
        likes = data.get("likes", 0)
        rating = data.get("avgRating", 0)
        total_views += views
        total_likes += likes
        books.append({
            "id": data.get("id"),
            "title": data.get("title"),
            "views": views,
            "likes": likes,
            "avgRating": rating,
            "ratingCount": data.get("ratingCount", 0),
            "createdAt": data.get("createdAt"),
            "isPaid": data.get("isPaid", False),
            "price": data.get("price", 0),
        })

    # Sort by views descending
    books.sort(key=lambda x: x["views"], reverse=True)

    return {
        "totalViews": total_views,
        "totalLikes": total_likes,
        "totalBooks": len(books),
        "books": books,
    }


# ─── TRENDING ────────────────────────────────────────────────────────────────

@router.get("/trending")
async def get_trending(limit: int = 10):
    """Get trending books (top by views). Sorted in Python to avoid composite index."""
    if not db:
        return {"trending": []}

    docs = db.collection("published_books")\
             .where("isPublished", "==", True)\
             .limit(200)\
             .stream()

    all_books = [doc.to_dict() for doc in docs]
    all_books.sort(key=lambda b: b.get("views", 0), reverse=True)
    return {"trending": all_books[:limit]}


# ─── SEARCH ──────────────────────────────────────────────────────────────────

@router.get("/search")
async def search_books(q: str = "", genre: str = "", sort: str = "latest"):
    """Search published books. Filtering and sorting done in Python to avoid composite indexes."""
    if not db:
        return {"results": []}

    # Single-field query only — no composite index needed
    docs = db.collection("published_books")\
             .where("isPublished", "==", True)\
             .limit(200)\
             .stream()

    q_lower = q.lower()
    results = []

    for doc in docs:
        data = doc.to_dict()
        # Genre filter
        if genre and genre != "all":
            if data.get("genre", "") != genre:
                continue
        # Text search filter
        if q_lower:
            haystack = (data.get("title", "") + " " + data.get("author", "")).lower()
            if q_lower not in haystack:
                continue
        results.append(data)

    # Sort in Python
    def get_ts(b):
        ts = b.get("createdAt")
        if ts and hasattr(ts, "timestamp"):
            return ts.timestamp()
        return 0

    if sort == "popular":
        results.sort(key=lambda b: b.get("views", 0), reverse=True)
    elif sort == "liked":
        results.sort(key=lambda b: b.get("likes", 0), reverse=True)
    else:  # latest
        results.sort(key=get_ts, reverse=True)

    return {"results": results}
