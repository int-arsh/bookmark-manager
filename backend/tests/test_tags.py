import pytest

from backend.app import create_app, db
from backend.config import TestingConfig


@pytest.fixture
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def create_bookmark(client, url="https://example.com", title="Example", tags=None):
    payload = {"url": url, "title": title}
    if tags is not None:
        payload["tags"] = tags
    return client.post("/api/bookmarks", json=payload)


def test_tags_list_with_counts(client):
    create_bookmark(client, url="https://example.com/1", title="One", tags=["python"])
    create_bookmark(client, url="https://example.com/2", title="Two", tags=["python", "flask"])

    resp = client.get("/api/tags")
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["success"] is True

    tags = {t["name"]: t["bookmark_count"] for t in body["data"]}
    assert tags["python"] == 2
    assert tags["flask"] == 1


def test_cannot_delete_tag_with_bookmarks_attached(client):
    create_bookmark(client, tags=["python"])

    resp = client.get("/api/tags")
    tag_id = resp.get_json()["data"][0]["id"]

    resp = client.delete(f"/api/tags/{tag_id}")
    assert resp.status_code == 400
    body = resp.get_json()
    assert body["success"] is False
    assert "Cannot delete tag with bookmarks attached" in body["error"]


def test_delete_orphan_tag(client):
    # create bookmark with tag then delete bookmark, leaving orphan tag
    resp = create_bookmark(client, tags=["python"])
    bookmark_id = resp.get_json()["data"]["id"]

    resp = client.get("/api/tags")
    tag_id = resp.get_json()["data"][0]["id"]

    client.delete(f"/api/bookmarks/{bookmark_id}")

    resp = client.delete(f"/api/tags/{tag_id}")
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["success"] is True

