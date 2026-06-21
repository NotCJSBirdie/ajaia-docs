# Architecture Note

## Overview

The application is a lightweight collaborative document editor built within a constrained 4–6 hour implementation window.

## Key Decisions

### SQLite

SQLite was selected because it provides persistence without requiring external infrastructure or paid services.

### TipTap

TipTap was selected to provide rich-text editing quickly while supporting headings, lists, bold, italic, and underline formatting.

### Seeded Users

Instead of implementing a complete authentication system, two seeded users were used to demonstrate ownership and sharing functionality.

### Sharing Model

Documents have an owner and can be shared with another user through a simple document_shares table.

## Deliberate Scope Cuts

The following features were intentionally excluded:

- Real-time collaboration
- Comments
- Version history
- Role-based permissions
- Google authentication
- DOCX parsing

These features were deprioritized to focus on completing the core workflow end-to-end with persistence and deployment.
