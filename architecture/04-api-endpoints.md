# API Endpoints Architecture

```mermaid
graph LR
    subgraph "Frontend API Layer"
        BookmarksAPI[bookmarks.js]
        TagsAPI[tags.js]
    end
    
    subgraph "Flask Routes"
        BookmarksRoutes[bookmarks.py]
        TagsRoutes[tags.py]
    end
    
    subgraph "Validation Layer"
        PydanticSchemas[Pydantic Schemas]
    end
    
    subgraph "Data Layer"
        SQLAlchemyModels[SQLAlchemy Models]
        SQLite[(SQLite DB)]
    end
    
    BookmarksAPI -->|GET /api/bookmarks| BookmarksRoutes
    BookmarksAPI -->|POST /api/bookmarks| BookmarksRoutes
    BookmarksAPI -->|GET /api/bookmarks/:id| BookmarksRoutes
    BookmarksAPI -->|PUT /api/bookmarks/:id| BookmarksRoutes
    BookmarksAPI -->|DELETE /api/bookmarks/:id| BookmarksRoutes
    BookmarksAPI -->|PATCH /api/bookmarks/:id/read| BookmarksRoutes
    
    TagsAPI -->|GET /api/tags| TagsRoutes
    TagsAPI -->|DELETE /api/tags/:id| TagsRoutes
    
    BookmarksRoutes --> PydanticSchemas
    TagsRoutes --> PydanticSchemas
    
    PydanticSchemas --> SQLAlchemyModels
    SQLAlchemyModels --> SQLite
    
    style BookmarksAPI fill:#2563eb,stroke:#1e40af,stroke-width:2px,color:#fff
    style TagsAPI fill:#2563eb,stroke:#1e40af,stroke-width:2px,color:#fff
    style BookmarksRoutes fill:#dc2626,stroke:#b91c1c,stroke-width:2px,color:#fff
    style TagsRoutes fill:#dc2626,stroke:#b91c1c,stroke-width:2px,color:#fff
    style PydanticSchemas fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    style SQLAlchemyModels fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
    style SQLite fill:#7c3aed,stroke:#6d28d9,stroke-width:2px,color:#fff
```

## Endpoint Details

### Bookmarks API

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/bookmarks` | List all bookmarks | `tag`, `search`, `is_read` |
| POST | `/api/bookmarks` | Create new bookmark | - |
| GET | `/api/bookmarks/<id>` | Get single bookmark | - |
| PUT | `/api/bookmarks/<id>` | Update bookmark | - |
| DELETE | `/api/bookmarks/<id>` | Delete bookmark | - |
| PATCH | `/api/bookmarks/<id>/read` | Toggle read status | - |

### Tags API

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/tags` | List all tags with counts | - |
| DELETE | `/api/tags/<id>` | Delete tag (if no bookmarks) | - |

## Request/Response Format

### Standard Response Structure
```json
{
  "success": true|false,
  "data": {...} | [...],
  "error": null | "error message"
}
```

### Error Handling Flow

1. **Validation Error** (400): Pydantic schema validation fails
2. **Not Found** (404): Resource doesn't exist
3. **Conflict** (409): Duplicate URL or constraint violation
4. **Server Error** (500): Database or unexpected error (logged, not exposed)

## Validation Rules

- **URL**: Must be valid http/https URL (Pydantic HttpUrl)
- **Title**: Required, max 200 chars, cannot be whitespace-only
- **Tag Names**: Lowercase, alphanumeric + hyphens only
- **Duplicate URLs**: Returns 409 Conflict
- **Tag Deletion**: Returns 400 if bookmarks attached
