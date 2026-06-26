# Backend Architecture

## Folder Structure

```

backend/

└── src/

├── config/

├── middleware/

├── modules/

│ ├── auth/

│ ├── organization/

│ ├── project/

│ ├── invitation/

│ ├── feature/

│ ├── audit/

│

├── shared/

│ ├── constants/

│ ├── errors/

│ ├── utils/

│ └── types/

│

├── app.ts

└── server.ts

```

---

## Module Structure

```

feature/

feature.routes.ts

feature.controller.ts

feature.service.ts

feature.repository.ts

feature.model.ts

feature.validation.ts

feature.types.ts

feature.constants.ts

feature.errors.ts

```

---

## Layer Responsibilities

### Route

Maps URL to controller.

---

### Controller

- Reads request
- Calls service
- Sends response

No business logic.

---

### Service

Contains business rules.

Examples:

- Enable Feature
- Validate Rollout
- Check Permissions

---

### Repository

Only communicates with database.

Examples:

- findById()
- create()
- update()

---

### Model

MongoDB schema.

---

### Validation

Request validation using Zod.

---

### Middleware

Authentication

Authorization

Validation

Logging

---

## Response Format

Success

```json
{
    "success": true,
    "message": "Feature enabled successfully",
    "data": {}
}
```

Error

```json
{
    "success": false,
    "message": "Unauthorized",
    "errorCode": "AUTH_001"
}
```

---

## Coding Standards

- Controller must not access MongoDB directly.
- Service must not send HTTP responses.
- Repository must not contain business logic.
- Every API should be validated.
- Every protected route requires JWT.
- Every feature modification creates an Audit Log.
