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


def test_create_bookmark_valid(client):
    resp = create_bookmark(client)
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["success"] is True
    assert body["data"]["url"] == "https://example.com"


def test_create_bookmark_invalid_url(client):
    resp = create_bookmark(client, url="not-a-url")
    assert resp.status_code == 400
    body = resp.get_json()
    assert body["success"] is False
    assert "url" in body["error"]


def test_create_bookmark_missing_title(client):
    resp = client.post(
        "/api/bookmarks",
        json={"url": "https://example.com"},
    )
    assert resp.status_code == 400
    body = resp.get_json()
    assert body["success"] is False
    assert "title" in body["error"]


def test_create_bookmark_duplicate_url(client):
    create_bookmark(client)
    resp = create_bookmark(client)
    assert resp.status_code == 409
    body = resp.get_json()
    assert body["success"] is False
    assert "already exists" in body["error"]


def test_list_bookmarks_no_filters(client):
    create_bookmark(client, url="https://example.com/1", title="One")
    create_bookmark(client, url="https://example.com/2", title="Two")

    resp = client.get("/api/bookmarks")
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["success"] is True
    assert len(body["data"]) == 2


def test_list_bookmarks_filter_by_tag(client):
    create_bookmark(
        client,
        url="https://example.com/python",
        title="Python",
        tags=["python"],
    )
    create_bookmark(
        client,
        url="https://example.com/flask",
        title="Flask",
        tags=["flask"],
    )

    resp = client.get("/api/bookmarks?tag=python")
    assert resp.status_code == 200
    body = resp.get_json()
    assert len(body["data"]) == 1
    assert body["data"][0]["title"] == "Python"


def test_list_bookmarks_filter_by_search(client):
    create_bookmark(
        client,
        url="https://example.com/python",
        title="Python Guide",
    )
    create_bookmark(
        client,
        url="https://example.com/flask",
        title="Flask Intro",
    )

    resp = client.get("/api/bookmarks?search=guide")
    assert resp.status_code == 200
    body = resp.get_json()
    assert len(body["data"]) == 1
    assert body["data"][0]["title"] == "Python Guide"


def test_list_bookmarks_filter_by_is_read(client):
    # unread
    create_bookmark(
        client,
        url="https://example.com/1",
        title="One",
    )
    # mark as read
    resp = create_bookmark(
        client,
        url="https://example.com/2",
        title="Two",
    )
    bookmark_id = resp.get_json()["data"]["id"]
    client.patch(f"/api/bookmarks/{bookmark_id}/read")

    resp = client.get("/api/bookmarks?is_read=true")
    assert resp.status_code == 200
    body = resp.get_json()
    assert len(body["data"]) == 1
    assert body["data"][0]["is_read"] is True


def test_update_bookmark(client):
    resp = create_bookmark(client)
    bookmark_id = resp.get_json()["data"]["id"]

    resp = client.put(
        f"/api/bookmarks/{bookmark_id}",
        json={"title": "Updated Title", "tags": ["updated"]},
    )
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["data"]["title"] == "Updated Title"
    assert body["data"]["tags"][0]["name"] == "updated"


def test_delete_bookmark(client):
    resp = create_bookmark(client)
    bookmark_id = resp.get_json()["data"]["id"]

    resp = client.delete(f"/api/bookmarks/{bookmark_id}")
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["success"] is True

    resp = client.get(f"/api/bookmarks/{bookmark_id}")
    assert resp.status_code == 404


def test_toggle_read_status(client):
    resp = create_bookmark(client)
    bookmark_id = resp.get_json()["data"]["id"]

    resp = client.patch(f"/api/bookmarks/{bookmark_id}/read")
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["data"]["is_read"] is True

    resp = client.patch(f"/api/bookmarks/{bookmark_id}/read")
    body = resp.get_json()
    assert body["data"]["is_read"] is False


def test_tag_auto_creation_on_bookmark_create(client):
    resp = create_bookmark(client, tags=["python", "flask"])
    assert resp.status_code == 201
    body = resp.get_json()
    tag_names = sorted([t["name"] for t in body["data"]["tags"]])
    assert tag_names == ["flask", "python"]

