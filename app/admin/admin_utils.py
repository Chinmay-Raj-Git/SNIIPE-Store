from functools import wraps
from flask import request, jsonify, g
from app import get_supabase
from ..models import Users
from .. import db
from ..auth_utils import _validate_token_and_get_user
import requests
import os
from datetime import datetime, timedelta

_shiprocket_token = None
_shiprocket_token_expiry = None

def fetch_shiprocket_order(shiprocket_order_id):
    token = get_shiprocket_token()

    url = f"https://apiv2.shiprocket.in/v1/external/orders/show/{shiprocket_order_id}"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    res = requests.get(url, headers=headers)
    res.raise_for_status()

    return res.json()


def get_shiprocket_token():
    global _shiprocket_token, _shiprocket_token_expiry

    if _shiprocket_token and _shiprocket_token_expiry > datetime.utcnow():
        return _shiprocket_token

    url = f"{os.getenv('SHIPROCKET_BASE_URL')}/auth/login"
    payload = {
        "email": os.getenv("SHIPROCKET_EMAIL"),
        "password": os.getenv("SHIPROCKET_PASSWORD")
    }

    res = requests.post(url, json=payload)
    print("Shiprocket auth response:", res.text)
    res.raise_for_status()

    data = res.json()
    _shiprocket_token = data["token"]
    _shiprocket_token_expiry = datetime.utcnow() + timedelta(hours=8)

    return _shiprocket_token

ADMIN_EMAILS = [
    "ychinmayraj06@gmail.com",
    "rahul.maganti2004@gmail.com",
    "aurangabadkaraditi07@gmail.com"
]

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get("admin_token")
        if not token:
            return jsonify({"error": "Missing or invalid token"}), 401
        
        user, error = _validate_token_and_get_user(token)
        
        if error:
            return jsonify({"error": error}), 401

        # Check if user is admin
        if user.email not in ADMIN_EMAILS:
            return jsonify({"error": "Admin access only"}), 403

        # Attach admin user to flask global context
        g.admin = user
        return f(*args, **kwargs)

    return decorated
