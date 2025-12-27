# app/auth_utils.py

from functools import wraps
from flask import request, jsonify, g
from app import get_supabase
from .models import Users
from . import db

def _validate_token_and_get_user(token):
    """Common token validation and user retrieval logic"""
    supabase = get_supabase()
    
    try:
        res = supabase.auth.get_user(token)
        user_info = res.user
        if not user_info:
            return None, "Invalid or expired token"

        # Check if user exists locally, create if not
        user = Users.query.get(user_info.id)
        if not user:
            user = Users(
                id=user_info.id,
                email=user_info.email,
                name=None,
                created_at=user_info.created_at
            )
            db.session.add(user)
            db.session.commit()

        return user, None
    
    except Exception as e:
        return None, f"Authentication failed: {str(e)}"

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401

        token = auth_header.split("Bearer ")[1].strip()
        user, error = _validate_token_and_get_user(token)
        
        if error:
            return jsonify({"error": error}), 401

        # Attach user to flask global context
        g.user = user
        return f(*args, **kwargs)

    return decorated
