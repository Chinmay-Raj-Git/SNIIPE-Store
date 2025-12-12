from flask import Blueprint

# Define blueprint without url_prefix here. We'll register it in create_app().
admin_bp = Blueprint("admin", __name__)

# Import routes so blueprint endpoints are registered on import.
from . import admin_routes  # noqa: F401
