import os
import stripe
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class CheckoutRequest(BaseModel):
    comic_id: str
    title: str
    price: int  # in cents

@router.post("/checkout")
async def create_checkout_session(request: CheckoutRequest):
    if not stripe.api_key:
        # If no Stripe key is configured, return a mock success URL for testing purposes
        print("Warning: STRIPE_SECRET_KEY not set. Returning mock success URL.")
        return {"url": f"http://localhost:5173/comic/{request.comic_id}?success=true"}

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': request.title,
                        'description': 'Unlock full access to this comic book',
                    },
                    'unit_amount': request.price,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"http://localhost:5173/comic/{request.comic_id}?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"http://localhost:5173/comic/{request.comic_id}?canceled=true",
        )
        return {"url": session.url}
    except Exception as e:
        print(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
