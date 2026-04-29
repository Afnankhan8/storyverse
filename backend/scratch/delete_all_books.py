import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load env
load_dotenv()

# Initialize Firebase
if not firebase_admin._apps:
    firebase_key = os.getenv("FIREBASE_KEY")
    if not firebase_key:
        print("Error: FIREBASE_KEY environment variable is missing")
        exit(1)
    
    try:
        cred_dict = json.loads(firebase_key)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized...")
    except Exception as e:
        print(f"Error: {e}")
        exit(1)

db = firestore.client()

def delete_collection(coll_ref, batch_size):
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        print(f'Deleting doc {doc.id} => {doc.to_dict().get("title")}')
        doc.reference.delete()
        deleted += 1

    if deleted >= batch_size:
        return delete_collection(coll_ref, batch_size)

print("Starting to delete all books in 'books' collection...")
delete_collection(db.collection('books'), 10)
print("Finished! All books have been removed from your library.")
