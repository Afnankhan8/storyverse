import firebase_admin
from firebase_admin import credentials, firestore
import os

# Path to your service account JSON
SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

# Firestore DB instance
db = firestore.client()