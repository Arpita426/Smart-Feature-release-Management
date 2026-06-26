# API Contracts

## Authentication

POST /api/auth/register

POST /api/auth/login

GET /api/auth/profile

---

## Organization

POST /api/organizations

GET /api/organizations

PUT /api/organizations/:id

DELETE /api/organizations/:id

---

## Projects

POST /api/projects

GET /api/projects

GET /api/projects/:id

PUT /api/projects/:id

DELETE /api/projects/:id

---

## Invitations

POST /api/invitations

GET /api/invitations

POST /api/invitations/:token/accept

DELETE /api/invitations/:id

---

## Feature Flags

POST /api/features

GET /api/features

GET /api/features/:id

PATCH /api/features/:id

DELETE /api/features/:id

---

## Feature Configuration

PATCH /api/features/:id/configuration

GET /api/features/:id/configuration

---

## Audit Logs

GET /api/audit

GET /api/audit/:featureId

---

## SDK

GET /api/sdk/features/:featureKey
