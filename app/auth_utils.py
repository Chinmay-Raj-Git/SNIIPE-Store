# app/auth_utils.py

from functools import wraps
from flask import request, jsonify, g
from app import get_supabase
from .models import Users

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401

        token = auth_header.split("Bearer ")[1].strip()
        supabase = get_supabase()

        try:
            res = supabase.auth.get_user(token)
            user_info = res.user
            if not user_info:
                return jsonify({"error": "Invalid or expired token"}), 401

            # Check if user exists locally
            user = Users.query.get(user_info.id)
            if not user:
                user = Users(
                    id=user_info.id,
                    email=user_info.email,
                    name=None,
                    created_at=user_info.created_at
                )
                from . import db
                db.session.add(user)
                db.session.commit()

            # Attach user to flask global context
            g.user = user

        except Exception as e:
            return jsonify({"error": f"Authentication failed: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated
