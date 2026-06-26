# API Design

The application follows RESTful API design principles.

---

# Authentication APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/profile | Get current user |

---

# Organization APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/organizations | Create organization |
| GET | /api/organizations | List organizations |
| GET | /api/organizations/:id | Get organization |
| PUT | /api/organizations/:id | Update organization |

---

# Project APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/projects | Create project |
| GET | /api/projects | List projects |
| GET | /api/projects/:id | Get project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Archive project |

---

# Invitation APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/invitations | Send invitation |
| GET | /api/invitations | List invitations |
| POST | /api/invitations/:token/accept | Accept invitation |
| DELETE | /api/invitations/:id | Cancel invitation |

---

# Feature Flag APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/features | Create feature flag |
| GET | /api/features | List feature flags |
| GET | /api/features/:id | Get feature flag |
| PATCH | /api/features/:id | Update feature flag |
| DELETE | /api/features/:id | Archive feature flag |

---

# Feature Configuration APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/features/:id/configuration | Get configuration |
| PATCH | /api/features/:id/configuration | Update configuration |

---

# Audit APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/audit | List audit logs |
| GET | /api/audit/:featureId | Get feature history |

---

# SDK APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/sdk/features/:featureKey | Evaluate feature |

---

# Response Format

## Success

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "message": "Unauthorized.",
  "errorCode": "AUTH_001"
}
```

---

# Authentication

Protected APIs require:

```
Authorization: Bearer <JWT_TOKEN>
```

---

# HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |