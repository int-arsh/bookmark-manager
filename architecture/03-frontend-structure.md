# Frontend Component Structure

```mermaid
graph TD
    App[App.jsx] --> HomePage[HomePage.jsx]
    
    HomePage --> useBookmarks[useBookmarks Hook]
    HomePage --> useTags[useTags Hook]
    HomePage --> Modal[Modal Component]
    HomePage --> TagFilter[TagFilter Component]
    HomePage --> SearchBar[SearchBar Component]
    HomePage --> BookmarkList[BookmarkList Component]
    HomePage --> EmptyState[EmptyState Component]
    HomePage --> ErrorMessage[ErrorMessage Component]
    HomePage --> LoadingSpinner[LoadingSpinner Component]
    
    BookmarkList --> BookmarkCard[BookmarkCard Component]
    Modal --> BookmarkForm[BookmarkForm Component]
    
    useBookmarks --> BookmarksAPI[bookmarks.js API]
    useTags --> TagsAPI[tags.js API]
    
    BookmarksAPI --> Axios[Axios HTTP Client]
    TagsAPI --> Axios
    
    BookmarkForm --> Validators[validators.js]
    
    Axios --> Backend[Flask Backend :5000]
    
    style HomePage fill:#2563eb,stroke:#1e40af,stroke-width:2px,color:#fff
    style useBookmarks fill:#d97706,stroke:#b45309,stroke-width:2px,color:#fff
    style useTags fill:#d97706,stroke:#b45309,stroke-width:2px,color:#fff
    style BookmarksAPI fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
    style TagsAPI fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
    style Backend fill:#dc2626,stroke:#b91c1c,stroke-width:2px,color:#fff
    style BookmarkForm fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    style Validators fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
```

## Component Hierarchy

### Pages
- **`HomePage.jsx`**: Main application page, orchestrates all components

### Components
- **`BookmarkCard.jsx`**: Displays a single bookmark with actions
- **`BookmarkList.jsx`**: Grid layout of BookmarkCard components
- **`BookmarkForm.jsx`**: Form for creating/editing bookmarks
- **`TagFilter.jsx`**: Sidebar tag filter with counts
- **`SearchBar.jsx`**: Search input with read/unread filter
- **`Modal.jsx`**: Reusable modal wrapper with focus trap
- **`EmptyState.jsx`**: Shown when no bookmarks match filters
- **`ErrorMessage.jsx`**: Displays error messages
- **`LoadingSpinner.jsx`**: Loading indicator

### Hooks
- **`useBookmarks.js`**: Manages bookmark state, filters, and CRUD operations
- **`useTags.js`**: Manages tag state and fetching

### API Layer
- **`bookmarks.js`**: All bookmark-related API calls
- **`tags.js`**: All tag-related API calls

### Utils
- **`validators.js`**: URL validation and input parsing helpers

## Data Flow

1. **User Action** → Component event handler
2. **Component** → Calls hook function
3. **Hook** → Calls API function
4. **API** → Makes HTTP request to backend
5. **Response** → Flows back through layers
6. **Hook** → Updates state
7. **Component** → Re-renders with new data
