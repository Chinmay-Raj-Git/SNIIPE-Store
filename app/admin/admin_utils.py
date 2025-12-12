from functools import wraps
from flask import request, jsonify, g
from app import get_supabase
from ..models import Users
from .. import db

ADMIN_EMAILS = [
    "ychinmayraj06@gmail.com",
    "rahul.maganti2004@gmail.com"
]

def require_admin(f):
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

            if not user_info or not user_info.email:
                return jsonify({"error": "Invalid token"}), 401

            # Not an admin
            if user_info.email not in ADMIN_EMAILS:
                return jsonify({"error": "Admin access only"}), 403

            # Ensure user exists locally in DB
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

            g.admin = user

        except Exception as e:
            return jsonify({"error": f"Authentication failed: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated
