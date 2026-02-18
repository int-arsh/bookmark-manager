# Data Flow Diagrams

## Creating a Bookmark

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant BookmarkForm as 📝 BookmarkForm
    participant useBookmarks as 🪝 useBookmarks
    participant BookmarksAPI as 🌐 BookmarksAPI
    participant FlaskRoute as 🛣️ FlaskRoute
    participant PydanticSchema as ✅ PydanticSchema
    participant SQLAlchemy as 🗄️ SQLAlchemy
    participant SQLite as 💾 SQLite

    User->>BookmarkForm: Fills form & submits
    BookmarkForm->>BookmarkForm: Validate inputs (validators.js)
    BookmarkForm->>useBookmarks: addBookmark(payload)
    useBookmarks->>useBookmarks: setLoading(true)
    useBookmarks->>BookmarksAPI: createBookmark(payload)
    BookmarksAPI->>FlaskRoute: POST /api/bookmarks
    FlaskRoute->>PydanticSchema: BookmarkCreate.validate()
    alt Validation fails
        PydanticSchema-->>FlaskRoute: ValidationError
        FlaskRoute-->>BookmarksAPI: 400 Bad Request
        BookmarksAPI-->>useBookmarks: throw error
        useBookmarks-->>BookmarkForm: Error message
    else Validation succeeds
        PydanticSchema-->>FlaskRoute: Validated data
        FlaskRoute->>SQLAlchemy: Check duplicate URL
        alt Duplicate URL
            SQLAlchemy-->>FlaskRoute: Existing bookmark found
            FlaskRoute-->>BookmarksAPI: 409 Conflict
            BookmarksAPI-->>useBookmarks: throw error
        else New bookmark
            FlaskRoute->>SQLAlchemy: Create bookmark & tags
            SQLAlchemy->>SQLite: INSERT bookmark
            SQLAlchemy->>SQLite: INSERT/CREATE tags
            SQLAlchemy->>SQLite: INSERT bookmark_tags
            SQLite-->>SQLAlchemy: Success
            SQLAlchemy-->>FlaskRoute: Bookmark object
            FlaskRoute-->>BookmarksAPI: 201 Created
            BookmarksAPI-->>useBookmarks: Bookmark data
            useBookmarks->>useBookmarks: fetchBookmarks() (refresh)
            useBookmarks->>useBookmarks: setLoading(false)
            useBookmarks-->>BookmarkForm: Success
            BookmarkForm->>BookmarkForm: Close modal & reset form
        end
    end

    rect rgb(37, 99, 235)
        Note over User,BookmarkForm: Frontend Layer
    end
    rect rgb(220, 38, 38)
        Note over FlaskRoute,PydanticSchema: Backend Layer
    end
    rect rgb(124, 58, 237)
        Note over SQLAlchemy,SQLite: Data Layer
    end
```

## Filtering Bookmarks

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant SearchBar as 🔍 SearchBar
    participant useBookmarks as 🪝 useBookmarks
    participant BookmarksAPI as 🌐 BookmarksAPI
    participant FlaskRoute as 🛣️ FlaskRoute
    participant SQLAlchemy as 🗄️ SQLAlchemy
    participant SQLite as 💾 SQLite

    User->>SearchBar: Types search query
    SearchBar->>SearchBar: Debounce (300ms)
    SearchBar->>useBookmarks: setFilter('search', value)
    useBookmarks->>useBookmarks: Update filters state
    useBookmarks->>useBookmarks: fetchBookmarks() (useEffect)
    useBookmarks->>BookmarksAPI: getBookmarks({search, tag, is_read})
    BookmarksAPI->>FlaskRoute: GET /api/bookmarks?search=...
    FlaskRoute->>SQLAlchemy: Query with filters
    SQLAlchemy->>SQLite: SELECT with WHERE conditions
    SQLite-->>SQLAlchemy: Filtered bookmarks
    SQLAlchemy-->>FlaskRoute: Bookmark list
    FlaskRoute-->>BookmarksAPI: 200 OK
    BookmarksAPI-->>useBookmarks: Bookmark array
    useBookmarks->>useBookmarks: setBookmarks(data)
    useBookmarks-->>SearchBar: Updated bookmarks
    SearchBar-->>User: Display filtered results

    rect rgb(37, 99, 235)
        Note over User,useBookmarks: Frontend Layer
    end
    rect rgb(220, 38, 38)
        Note over FlaskRoute: Backend Layer
    end
    rect rgb(124, 58, 237)
        Note over SQLAlchemy,SQLite: Data Layer
    end
```

## Toggle Read Status

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant BookmarkCard as 🃏 BookmarkCard
    participant useBookmarks as 🪝 useBookmarks
    participant BookmarksAPI as 🌐 BookmarksAPI
    participant FlaskRoute as 🛣️ FlaskRoute
    participant SQLAlchemy as 🗄️ SQLAlchemy
    participant SQLite as 💾 SQLite

    User->>BookmarkCard: Clicks "Mark Read"
    BookmarkCard->>useBookmarks: toggleRead(bookmarkId)
    useBookmarks->>useBookmarks: setLoading(true)
    useBookmarks->>BookmarksAPI: toggleRead(id)
    BookmarksAPI->>FlaskRoute: PATCH /api/bookmarks/:id/read
    FlaskRoute->>SQLAlchemy: Get bookmark by ID
    SQLAlchemy->>SQLite: SELECT bookmark
    SQLite-->>SQLAlchemy: Bookmark found
    FlaskRoute->>SQLAlchemy: Toggle is_read field
    SQLAlchemy->>SQLite: UPDATE bookmarks SET is_read = NOT is_read
    SQLite-->>SQLAlchemy: Success
    SQLAlchemy-->>FlaskRoute: Updated bookmark
    FlaskRoute-->>BookmarksAPI: 200 OK
    BookmarksAPI-->>useBookmarks: Updated bookmark
    useBookmarks->>useBookmarks: fetchBookmarks() (refresh)
    useBookmarks->>useBookmarks: setLoading(false)
    useBookmarks-->>BookmarkCard: Updated state
    BookmarkCard-->>User: UI updates (badge changes)

    rect rgb(37, 99, 235)
        Note over User,useBookmarks: Frontend Layer
    end
    rect rgb(220, 38, 38)
        Note over FlaskRoute: Backend Layer
    end
    rect rgb(124, 58, 237)
        Note over SQLAlchemy,SQLite: Data Layer
    end
```

## Key Patterns

1. **Always validate** at the schema layer before DB operations
2. **Always refetch** after mutations to ensure consistency
3. **Debounce search** to avoid excessive API calls
4. **Handle errors** at every layer with user-friendly messages
5. **Loading states** shown during all async operations
6. **Optimistic updates** not used - always wait for server confirmation
