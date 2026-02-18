from datetime import datetime
from typing import List

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import db


class BookmarkTag(db.Model):
    __tablename__ = "bookmark_tags"

    bookmark_id: Mapped[int] = mapped_column(
        ForeignKey("bookmarks.id"), primary_key=True
    )
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id"), primary_key=True)


class Bookmark(db.Model):
    __tablename__ = "bookmarks"

    id: Mapped[int] = mapped_column(primary_key=True)
    url: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    tags: Mapped[List["Tag"]] = relationship(
        "Tag",
        secondary="bookmark_tags",
        back_populates="bookmarks",
        lazy="selectin",
    )


class Tag(db.Model):
    __tablename__ = "tags"
    __table_args__ = (UniqueConstraint("name", name="uq_tag_name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    bookmarks: Mapped[List[Bookmark]] = relationship(
        "Bookmark",
        secondary="bookmark_tags",
        back_populates="tags",
        lazy="selectin",
    )

    @property
    def bookmark_count(self) -> int:
        return len(self.bookmarks)

