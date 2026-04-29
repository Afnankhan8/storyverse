import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
load_dotenv()

# Initialize Firebase only once
if not firebase_admin._apps:
    firebase_key = os.getenv("FIREBASE_KEY")

    if not firebase_key:
        raise Exception("FIREBASE_KEY environment variable is missing")

    try:
        cred_dict = json.loads(firebase_key)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized successfully")

    except Exception as e:
        raise Exception(f"Firebase initialization failed: {str(e)}")

# Firestore database instance
db = firestore.client()