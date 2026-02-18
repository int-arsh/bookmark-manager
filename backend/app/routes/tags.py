import logging
from typing import Optional

from flask import Blueprint, jsonify
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError

from .. import db
from ..models import Tag, Bookmark

bp = Blueprint("tags", __name__)
logger = logging.getLogger(__name__)


def api_response(success: bool, data=None, error: Optional[str] = None, status: int = 200):
    return jsonify({"success": success, "data": data, "error": error}), status


@bp.route("", methods=["GET"])
def list_tags():
    try:
        stmt = (
            select(Tag, func.count(Bookmark.id))
            .select_from(Tag)
            .join(Tag.bookmarks, isouter=True)
            .group_by(Tag.id)
            .order_by(Tag.name.asc())
        )
        results = db.session.execute(stmt).all()

        data = [
            {
                "id": tag.id,
                "name": tag.name,
                "bookmark_count": count,
            }
            for tag, count in results
        ]
        return api_response(True, data=data)
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Database error while listing tags")
        return api_response(False, data=None, error="Database error", status=500)
    except Exception:
        logger.exception("Unexpected error while listing tags")
        return api_response(False, data=None, error="Internal server error", status=500)


@bp.route("/<int:tag_id>", methods=["DELETE"])
def delete_tag(tag_id: int):
    try:
        tag = db.session.get(Tag, tag_id)
        if not tag:
            return api_response(False, data=None, error="Tag not found", status=404)

        if tag.bookmarks:
            return api_response(
                False,
                data=None,
                error="Cannot delete tag with bookmarks attached",
                status=400,
            )

        db.session.delete(tag)
        db.session.commit()
        return api_response(True, data=None)
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Database error while deleting tag")
        return api_response(False, data=None, error="Database error", status=500)
    except Exception:
        logger.exception("Unexpected error while deleting tag")
        return api_response(False, data=None, error="Internal server error", status=500)

