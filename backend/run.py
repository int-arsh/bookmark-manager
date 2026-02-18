from backend.app import create_app, db
from backend.config import DevelopmentConfig


app = create_app(DevelopmentConfig)


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run()

