from typing import List, Optional

from pydantic import BaseModel, ConfigDict, HttpUrl, ValidationError, field_validator
import re


TAG_NAME_PATTERN = re.compile(r"^[a-z0-9-]+$")


class TagBase(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def normalize_and_validate_name(cls, v: str) -> str:
        v = v.strip().lower()
        if not v:
            raise ValueError("Tag name cannot be empty")
        if not TAG_NAME_PATTERN.match(v):
            raise ValueError(
                "Tag name must be lowercase, alphanumeric with hyphens only"
            )
        return v


class TagCreate(TagBase):
    pass


class TagOut(TagBase):
    id: int
    bookmark_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class BookmarkBase(BaseModel):
    url: HttpUrl
    title: str
    notes: Optional[str] = None
    is_read: bool = False
    tags: List[str] = []

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        if len(v.strip()) > 200:
            raise ValueError("Title must be at most 200 characters")
        return v.strip()

    @field_validator("tags", mode="before")
    @classmethod
    def ensure_list(cls, v):
        if v is None:
            return []
        return v

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, values):
        normalized = []
        for name in values:
            tag = TagCreate(name=name)
            normalized.append(tag.name)
        return normalized


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkUpdate(BaseModel):
    url: Optional[HttpUrl] = None
    title: Optional[str] = None
    notes: Optional[str] = None
    is_read: Optional[bool] = None
    tags: Optional[List[str]] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not v.strip():
            raise ValueError("Title cannot be empty")
        if len(v.strip()) > 200:
            raise ValueError("Title must be at most 200 characters")
        return v.strip()

    @field_validator("tags", mode="before")
    @classmethod
    def ensure_list(cls, v):
        if v is None:
            return v
        return v

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, values):
        if values is None:
            return values
        normalized = []
        for name in values:
            tag = TagCreate(name=name)
            normalized.append(tag.name)
        return normalized


class TagSimpleOut(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class BookmarkOut(BaseModel):
    id: int
    url: str
    title: str
    notes: Optional[str]
    is_read: bool
    created_at: str
    tags: List[TagSimpleOut]

    model_config = ConfigDict(from_attributes=True)

