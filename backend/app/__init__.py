import logging
from logging.handlers import RotatingFileHandler
import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError

from backend.config import DevelopmentConfig

load_dotenv()

db = SQLAlchemy()


def create_app(config_class: type = DevelopmentConfig) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    configure_logging(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)

    with app.app_context():
        # Keep it simple; no migrations.
        if not app.config.get("TESTING", False):
            db.create_all()

    register_blueprints(app)
    register_error_handlers(app)

    return app


def configure_logging(app: Flask) -> None:
    log_level = logging.INFO
    if app.config.get("DEBUG"):
        log_level = logging.DEBUG

    logging.basicConfig(level=log_level)

    log_dir = os.path.join(os.getcwd(), "logs")
    os.makedirs(log_dir, exist_ok=True)
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, "app.log"), maxBytes=10240, backupCount=10
    )
    file_handler.setLevel(log_level)
    formatter = logging.Formatter(
        "%(asctime)s %(levelname)s [%(name)s] %(message)s"
    )
    file_handler.setFormatter(formatter)
    app.logger.addHandler(file_handler)


def register_blueprints(app: Flask) -> None:
    from .routes.bookmarks import bp as bookmarks_bp
    from .routes.tags import bp as tags_bp

    app.register_blueprint(bookmarks_bp, url_prefix="/api/bookmarks")
    app.register_blueprint(tags_bp, url_prefix="/api/tags")


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(404)
    def not_found(error):
        app.logger.warning("404 Not Found: %s", getattr(error, "description", ""))
        return (
            jsonify({"success": False, "data": None, "error": "Not found"}),
            404,
        )

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error("500 Internal Server Error")
        return (
            jsonify(
                {
                    "success": False,
                    "data": None,
                    "error": "Internal server error",
                }
            ),
            500,
        )

    @app.errorhandler(SQLAlchemyError)
    def handle_db_error(error):
        app.logger.error("Database error: %s", str(error))
        return (
            jsonify(
                {
                    "success": False,
                    "data": None,
                    "error": "Database error",
                }
            ),
            500,
        )

