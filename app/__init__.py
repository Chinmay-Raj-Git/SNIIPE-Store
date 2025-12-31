from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
from supabase import create_client

db = SQLAlchemy()
migrate = Migrate()
_supabase = None

# app/__init__.py (patch - create_app)
def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "dev-secret")
    app.config['SUPABASE_URL'] = os.getenv("SUPABASE_URL")
    app.config['SUPABASE_KEY'] = os.getenv("SUPABASE_KEY")
    app.config['SUPABASE_SERVICE_ROLE_KEY'] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['RAZORPAY_KEY_ID'] = os.getenv("RAZORPAY_KEY_ID")
    app.config['RAZORPAY_KEY_SECRET'] = os.getenv("RAZORPAY_KEY_SECRET")


    db.init_app(app)
    migrate.init_app(app, db)

    global _supabase
    _supabase = create_client(app.config['SUPABASE_URL'], app.config['SUPABASE_SERVICE_ROLE_KEY'])

    # register main routes
    from . import routes
    app.register_blueprint(routes.bp)

    # register admin blueprint (only register here)
    from .admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix="/admin")
    

    return app


def get_supabase():
    global _supabase
    return _supabase