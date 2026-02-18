# System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        UI[User Interface]
        Components[React Components]
        Hooks[Custom Hooks]
        API_Layer[API Layer / Axios]
    end

    subgraph "Backend (Flask)"
        Routes[Route Handlers]
        Schemas[Pydantic Schemas]
        Models[SQLAlchemy Models]
        DB[(SQLite Database)]
    end

    UI --> Components
    Components --> Hooks
    Hooks --> API_Layer
    API_Layer -->|HTTP/REST| Routes
    Routes --> Schemas
    Schemas --> Models
    Models --> DB

    style UI fill:#2563eb,stroke:#1e40af,stroke-width:2px,color:#fff
    style Components fill:#2563eb,stroke:#1e40af,stroke-width:2px,color:#fff
    style Hooks fill:#2563eb,stroke:#1e40af,stroke-width:2px,color:#fff
    style API_Layer fill:#2563eb,stroke:#1e40af,stroke-width:2px,color:#fff
    style Routes fill:#dc2626,stroke:#b91c1c,stroke-width:2px,color:#fff
    style Schemas fill:#dc2626,stroke:#b91c1c,stroke-width:2px,color:#fff
    style Models fill:#dc2626,stroke:#b91c1c,stroke-width:2px,color:#fff
    style DB fill:#7c3aed,stroke:#6d28d9,stroke-width:2px,color:#fff
```

## Technology Stack

### Frontend
- **Framework**: React 18+ (Functional Components + Hooks)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **HTTP Client**: Axios
- **Port**: 5173 (dev)

### Backend
- **Framework**: Flask
- **ORM**: SQLAlchemy 2.x
- **Validation**: Pydantic v2
- **Database**: SQLite
- **CORS**: flask-cors
- **Port**: 5000

## Communication Flow

1. User interacts with React components
2. Components use custom hooks (`useBookmarks`, `useTags`)
3. Hooks call API layer functions (`src/api/bookmarks.js`, `src/api/tags.js`)
4. API layer makes HTTP requests to Flask backend
5. Flask routes validate requests with Pydantic schemas
6. Validated data is processed by SQLAlchemy models
7. Database operations execute on SQLite
8. Responses flow back through the same layers
