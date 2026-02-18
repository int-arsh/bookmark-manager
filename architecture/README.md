# Architecture Documentation

This directory contains architecture diagrams and documentation for the Bookmark Manager application.

## Diagrams

1. **[System Overview](./01-system-overview.md)** - High-level architecture, technology stack, and communication flow
2. **[Database Schema](./02-database-schema.md)** - ER diagram, table structures, and business rules
3. **[Frontend Structure](./03-frontend-structure.md)** - Component hierarchy and React architecture
4. **[API Endpoints](./04-api-endpoints.md)** - REST API structure, endpoints, and validation rules
5. **[Data Flow](./05-data-flow.md)** - Sequence diagrams for key user flows

## Quick Reference

### Project Structure
```
bookmark-manager/
├── backend/          # Flask API
│   ├── app/
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── schemas.py     # Pydantic validation
│   │   └── routes/        # API endpoints
│   ├── tests/        # pytest tests
│   └── run.py        # Entry point
│
└── frontend/         # React app
    └── src/
        ├── api/          # API client layer
        ├── components/   # React components
        ├── hooks/        # Custom hooks
        ├── pages/        # Page components
        └── utils/        # Helper functions
```

### Key Principles

- **Separation of Concerns**: API calls only in `api/` layer, state management in hooks
- **Validation First**: All requests validated with Pydantic before DB operations
- **Error Handling**: Consistent error responses, never expose internal errors
- **Type Safety**: Type hints in Python, PropTypes/TypeScript patterns in JS
- **Testing**: Every endpoint has tests, components handle edge cases

## Viewing Diagrams

These Mermaid diagrams can be viewed in:
- GitHub (renders automatically)
- VS Code with Mermaid extension
- Online at [mermaid.live](https://mermaid.live)
- Documentation tools like MkDocs, Docusaurus, etc.

## Updating Diagrams

When making architectural changes:
1. Update the relevant diagram file
2. Update this README if structure changes
3. Keep diagrams in sync with actual code
