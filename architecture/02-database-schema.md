# Database Schema

```mermaid
erDiagram
    BOOKMARK {
        int id PK
        string url UK "unique, required"
        string title "max 200 chars, required"
        text notes "optional"
        boolean is_read "default false"
        datetime created_at "auto"
    }

    TAG {
        int id PK
        string name UK "unique, lowercase, max 50 chars"
    }

    BOOKMARK_TAG {
        int bookmark_id FK
        int tag_id FK
    }

    BOOKMARK ||--o{ BOOKMARK_TAG : "has many"
    TAG ||--o{ BOOKMARK_TAG : "has many"
```

## Table Details

### `bookmarks`
- **Primary Key**: `id` (auto-increment integer)
- **Unique Constraint**: `url` (prevents duplicate bookmarks)
- **Relationships**: Many-to-many with `tags` via `bookmark_tags`

### `tags`
- **Primary Key**: `id` (auto-increment integer)
- **Unique Constraint**: `name` (lowercase, normalized)
- **Relationships**: Many-to-many with `bookmarks` via `bookmark_tags`

### `bookmark_tags` (Association Table)
- **Composite Primary Key**: (`bookmark_id`, `tag_id`)
- **Foreign Keys**: 
  - `bookmark_id` → `bookmarks.id`
  - `tag_id` → `tags.id`

## Business Rules

1. **Tag Normalization**: All tag names are stored in lowercase
2. **Tag Validation**: Tag names must be alphanumeric + hyphens only (no spaces)
3. **Duplicate Prevention**: URLs must be unique across all bookmarks
4. **Tag Deletion**: Tags cannot be deleted if they have associated bookmarks
5. **Auto-creation**: Tags are automatically created when referenced in a bookmark
