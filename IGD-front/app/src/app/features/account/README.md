# IGD Account Frontend

This directory contains the Account frontend feature.

## Structure

- `account.routes.ts`: Account feature routes.
- `models/`: Shared technical types.
- `services/`: Account API communication.
- `pages/overview/`: Account overview.
- `pages/profile/`: Basic account profile.
- `pages/legal-entity/`: Legal entity information.
- `pages/contacts/`: Phone and email information.
- `pages/verification/`: Verification status.
- `pages/security/`: Security settings.
- `pages/devices/`: Registered devices.
- `pages/sessions/`: User session interface.
- `pages/permissions/`: Authorization information.

## API integration

The API service uses the existing runtime configuration and Angular HttpClient.

The service currently contains GET operations for routes observed in the
Account backend server routing.

The existence of a route does not prove its complete request/response
contract or authorization behavior. Concrete DTOs, user identity resolution,
session behavior and authorization requirements must be verified before
connecting pages to live data.

No mock backend data is included.

## Deliberately not implemented

- Token storage.
- Authentication interceptor.
- Automatic current-user ID resolution.
- Password and authentication request payloads.
- Verification submission payloads.
- Device revocation commands.
- Session listing or revocation operations.
- Profile, phone, email or legal-entity mutation commands.

These require verified backend contracts and a confirmed authentication flow.