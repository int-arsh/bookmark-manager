# Claude.md — AI Guidance for Bookmark Manager

## Project Overview
This is a Bookmark Manager app built with Flask (backend) and React (frontend).
This file defines the rules and constraints for any AI agent working on this codebase.

## Non-Negotiable Rules

### Backend
- ALWAYS validate request bodies using Pydantic schemas before any DB operation
- NEVER expose raw SQLAlchemy errors, Python tracebacks, or internal details to API responses
- ALWAYS use try/except in every route and log errors with Python's logging module
- ALWAYS rollback DB session on error: db.session.rollback()
- NEVER bypass the schema layer and write directly to the DB from a route handler
- ALWAYS return responses in the standard format: { success, data, error }
- NEVER hardcode secrets — use environment variables via python-dotenv
- ALWAYS normalize tag names to lowercase before saving
- NEVER delete a tag that still has bookmarks attached — return 400

### Frontend
- NEVER put axios/fetch calls directly inside components — always use src/api/ layer
- NEVER hardcode the API base URL — always use import.meta.env.VITE_API_URL
- ALWAYS show loading state during any async operation
- ALWAYS show error state when an API call fails
- NEVER use class components — functional components and hooks only
- ALWAYS use controlled inputs in forms
- NEVER filter/search bookmarks client-side — always pass params to the API

### General
- Simple is better than clever — write readable, predictable code
- Small focused functions over large multi-purpose ones
- If a file exceeds 150 lines, consider splitting it
- Every new endpoint must have a corresponding test
- Every new component must handle loading and error states

## What AI Should NOT Do
- Do not add features not asked for
- Do not install new dependencies without flagging it
- Do not change the folder structure without explaining why
- Do not skip validation to "keep it simple"
- Do not generate tests that only test the happy path — always include edge cases
- Do not use any deprecated SQLAlchemy 1.x patterns

## Code Style
- Python: follow PEP8, use type hints where practical
- JS: use ES6+ syntax, arrow functions, destructuring
- No commented-out dead code in final output
- Meaningful variable names — no single letter variables except loop counters