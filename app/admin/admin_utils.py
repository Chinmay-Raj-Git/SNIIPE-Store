from functools import wraps
from flask import request, jsonify, g
from app import get_supabase
from ..models import Users
from .. import db
from ..auth_utils import _validate_token_and_get_user

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
