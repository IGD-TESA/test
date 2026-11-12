# IGD Account Frontend

## Implemented UI

- Account overview
- Personal profile form
- Legal entity form
- Phone and email management
- Verification document selection
- Security and password form
- Device management interface
- Session management interface
- Permission and role presentation
- Login
- Registration
- Password recovery

## Architecture

The feature uses a single lazy-loaded standalone workspace component.
Each route selects a separate section through route data.

The `AccountDemoStore` is an in-memory frontend demonstration adapter.
It is not a backend and does not persist credentials or sensitive data.

## Backend integration boundary

Replace `AccountDemoStore` operations with a verified Account API adapter.

Before integration, verify:
- Request and response DTOs
- Current-user identity resolution
- Authentication and authorization requirements
- Error response format
- Verification provider behavior
- Device and session management contracts
- File upload contract and storage constraints

No API endpoint is assumed to be operational by this UI package.