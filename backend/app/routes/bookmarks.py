import logging
from typing import List, Optional

from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from sqlalchemy import and_, or_, select, func
from sqlalchemy.exc import SQLAlchemyError

from .. import db
from ..models import Bookmark, Tag
from ..schemas import BookmarkCreate, BookmarkOut, BookmarkUpdate, TagSimpleOut

bp = Blueprint("bookmarks", __name__)
logger = logging.getLogger(__name__)


def api_response(success: bool, data=None, error: Optional[str] = None, status: int = 200):
    return jsonify({"success": success, "data": data, "error": error}), status


def serialize_bookmark(bookmark: Bookmark) -> dict:
    schema = BookmarkOut.model_validate(
        {
            "id": bookmark.id,
            "url": bookmark.url,
            "title": bookmark.title,
            "notes": bookmark.notes,
            "is_read": bookmark.is_read,
            "created_at": bookmark.created_at.isoformat(),
            "tags": [
                TagSimpleOut.model_validate(
                    {"id": tag.id, "name": tag.name}
                ).model_dump()
                for tag in bookmark.tags
            ],
        }
    )
    return schema.model_dump()


def get_or_create_tags(tag_names: List[str]) -> List[Tag]:
    if not tag_names:
        return []

    normalized_names = [name.strip().lower() for name in tag_names]

    existing_tags = db.session.execute(
        select(Tag).where(Tag.name.in_(normalized_names))
    ).scalars().all()
    existing_by_name = {t.name: t for t in existing_tags}

    result: List[Tag] = []

    for name in normalized_names:
        tag = existing_by_name.get(name)
        if not tag:
            tag = Tag(name=name)
            db.session.add(tag)
            existing_by_name[name] = tag
        result.append(tag)

    return result


def get_bookmark_by_id(bookmark_id: int) -> Optional[Bookmark]:
    return db.session.get(Bookmark, bookmark_id)


@bp.route("", methods=["GET"])
def list_bookmarks():
    try:
        tag_filter = request.args.get("tag")
        search = request.args.get("search")
        is_read_param = request.args.get("is_read")

        conditions = []

        if tag_filter:
            conditions.append(Bookmark.tags.any(Tag.name == tag_filter.strip().lower()))

        if search:
            term = f"%{search.strip().lower()}%"
            conditions.append(
                or_(
                    func.lower(Bookmark.title).like(term),
                    func.lower(Bookmark.notes).like(term),
                )
            )

        if is_read_param is not None:
            if is_read_param.lower() in ("true", "1"):
                conditions.append(Bookmark.is_read.is_(True))
            elif is_read_param.lower() in ("false", "0"):
                conditions.append(Bookmark.is_read.is_(False))

        stmt = select(Bookmark).order_by(Bookmark.created_at.desc())
        if conditions:
            stmt = stmt.where(and_(*conditions))

        bookmarks = db.session.execute(stmt).scalars().all()
        data = [serialize_bookmark(b) for b in bookmarks]
        return api_response(True, data=data)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.exception("Database error while listing bookmarks")
        return api_response(False, data=None, error="Database error", status=500)
    except Exception:
        logger.exception("Unexpected error while listing bookmarks")
        return api_response(False, data=None, error="Internal server error", status=500)


@bp.route("", methods=["POST"])
def create_bookmark():
    try:
        payload = request.get_json(silent=True) or {}
        try:
            schema = BookmarkCreate.model_validate(payload)
        except ValidationError as ve:
            msg = "; ".join(
                f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}"
                for err in ve.errors()
            )
            logger.info("Validation error on create bookmark: %s", msg)
            return api_response(False, data=None, error=msg, status=400)

        existing = db.session.execute(
            select(Bookmark).where(Bookmark.url == str(schema.url))
        ).scalar_one_or_none()
        if existing:
            return api_response(
                False,
                data=None,
                error="Bookmark with this URL already exists",
                status=409,
            )

        bookmark = Bookmark(
            url=str(schema.url),
            title=schema.title,
            notes=schema.notes,
            is_read=schema.is_read,
        )

        bookmark.tags = get_or_create_tags(schema.tags)

        db.session.add(bookmark)
        db.session.commit()

        return api_response(True, data=serialize_bookmark(bookmark), status=201)
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Database error while creating bookmark")
        return api_response(False, data=None, error="Database error", status=500)
    except Exception:
        logger.exception("Unexpected error while creating bookmark")
        return api_response(False, data=None, error="Internal server error", status=500)


@bp.route("/<int:bookmark_id>", methods=["GET"])
def get_bookmark(bookmark_id: int):
    try:
        bookmark = get_bookmark_by_id(bookmark_id)
        if not bookmark:
            return api_response(False, data=None, error="Bookmark not found", status=404)

        return api_response(True, data=serialize_bookmark(bookmark))
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Database error while retrieving bookmark")
        return api_response(False, data=None, error="Database error", status=500)
    except Exception:
        logger.exception("Unexpected error while retrieving bookmark")
        return api_response(False, data=None, error="Internal server error", status=500)


@bp.route("/<int:bookmark_id>", methods=["PUT"])
def update_bookmark(bookmark_id: int):
    try:
        bookmark = get_bookmark_by_id(bookmark_id)
        if not bookmark:
            return api_response(False, data=None, error="Bookmark not found", status=404)

        payload = request.get_json(silent=True) or {}
        try:
            schema = BookmarkUpdate.model_validate(payload)
        except ValidationError as ve:
            msg = "; ".join(
                f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}"
                for err in ve.errors()
            )
            logger.info("Validation error on update bookmark: %s", msg)
            return api_response(False, data=None, error=msg, status=400)

        if schema.url is not None and str(schema.url) != bookmark.url:
            existing = db.session.execute(
                select(Bookmark).where(
                    Bookmark.url == str(schema.url), Bookmark.id != bookmark.id
                )
            ).scalar_one_or_none()
            if existing:
                return api_response(
                    False,
                    data=None,
                    error="Bookmark with this URL already exists",
                    status=409,
                )
            bookmark.url = str(schema.url)

        if schema.title is not None:
            bookmark.title = schema.title
        if schema.notes is not None:
            bookmark.notes = schema.notes
        if schema.is_read is not None:
            bookmark.is_read = schema.is_read

        if schema.tags is not None:
            bookmark.tags = get_or_create_tags(schema.tags)

        db.session.commit()
        return api_response(True, data=serialize_bookmark(bookmark))
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Database error while updating bookmark")
        return api_response(False, data=None, error="Database error", status=500)
    except Exception:
        logger.exception("Unexpected error while updating bookmark")
        return api_response(False, data=None, error="Internal server error", status=500)


@bp.route("/<int:bookmark_id>", methods=["DELETE"])
def delete_bookmark(bookmark_id: int):
    try:
        bookmark = get_bookmark_by_id(bookmark_id)
        if not bookmark:
            return api_response(False, data=None, error="Bookmark not found", status=404)

        db.session.delete(bookmark)
        db.session.commit()
        return api_response(True, data=None)
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Database error while deleting bookmark")
        return api_response(False, data=None, error="Database error", status=500)
    except Exception:
        logger.exception("Unexpected error while deleting bookmark")
        return api_response(False, data=None, error="Internal server error", status=500)


@bp.route("/<int:bookmark_id>/read", methods=["PATCH"])
def toggle_read(bookmark_id: int):
    try:
        bookmark = get_bookmark_by_id(bookmark_id)
        if not bookmark:
            return api_response(False, data=None, error="Bookmark not found", status=404)

        bookmark.is_read = not bookmark.is_read
        db.session.commit()

        return api_response(True, data=serialize_bookmark(bookmark))
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Database error while toggling read state")
        return api_response(False, data=None, error="Database error", status=500)
    except Exception:
        logger.exception("Unexpected error while toggling read state")
        return api_response(False, data=None, error="Internal server error", status=500)

