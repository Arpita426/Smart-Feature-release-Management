# Development Guidelines

This document defines the coding standards, Git workflow, project conventions, and development practices for the Smart Feature Release Management System.

The goal is to maintain a clean, scalable, and maintainable codebase throughout the project.

---

# 1. Git Workflow

We follow a Git Flow inspired workflow.

## Branches

main
- Stable production-ready code.

develop
- Integration branch.
- Every feature is merged here before going to main.

feature/<feature-name>

Example

feature/authentication

feature/organization

feature/project

feature/invitation

feature/feature-flags

feature/redis-cache

bugfix/<bug-name>

hotfix/<critical-fix>

---

# 2. Commit Message Convention

Every commit should clearly explain the purpose.

Format

type(scope): message

Examples

feat(auth): implement user login

feat(project): create project API

fix(feature): resolve rollout validation bug

docs(er): finalize ER diagram

refactor(auth): separate service from repository

chore(config): add prettier configuration

Allowed Types

feat

fix

docs

refactor

style

test

chore

---

# 3. Pull Request Rules

Every feature must follow

Issue

↓

Feature Branch

↓

Development

↓

Pull Request

↓

Review

↓

Merge into develop

Pull Request Checklist

- Code compiles successfully.

- All APIs tested.

- Validation implemented.

- Error handling completed.

- Documentation updated.

- No console.log left.

---

# 4. Folder Structure

Every module follows the same structure.

module/

module.routes.ts

module.controller.ts

module.service.ts

module.repository.ts

module.model.ts

module.validation.ts

module.types.ts

module.constants.ts

module.errors.ts

No module should have a different structure.

---

# 5. Layer Responsibilities

Routes

- Define endpoints.
- Connect middleware.
- Call controllers.

Controllers

- Receive request.
- Call services.
- Return response.

No business logic.

Services

- Business logic.
- Authorization decisions.
- Validation beyond request schema.
- Redis updates.
- Audit creation.

Repositories

- MongoDB queries only.

Models

- Database schema only.

Validation

- Request validation using Zod.

---

# 6. Naming Convention

Variables

camelCase

Example

featureName

rolloutPercentage

Functions

camelCase

Example

createFeature()

enableFeature()

Classes

PascalCase

Example

FeatureService

InvitationRepository

Interfaces

Prefix with I

Example

IFeature

IUser

Enums

PascalCase

Example

ProjectRole

EnvironmentType

Constants

UPPER_SNAKE_CASE

Example

JWT_SECRET

MAX_ROLLOUT

Environment Variables

UPPER_SNAKE_CASE

Example

MONGO_URI

REDIS_URL

JWT_SECRET

PORT

---

# 7. API Response Format

Success

{
  "success": true,
  "message": "Feature enabled successfully.",
  "data": {}
}

Failure

{
  "success": false,
  "message": "Unauthorized.",
  "errorCode": "AUTH_001"
}

Every API should return the same structure.

---

# 8. Error Handling

Never expose internal server errors.

Use centralized error middleware.

Examples

AUTH_001

FEATURE_001

PROJECT_001

ORG_001

INVITATION_001

Every error should have

- Error Code
- Message
- HTTP Status

---

# 9. Validation Rules

All incoming requests must be validated.

Validation happens before controller execution.

No controller should manually validate request body.

---

# 10. Authentication

JWT Authentication

Protected routes require

Authorization

Bearer <token>

Passwords are always hashed.

Passwords are never returned.

---

# 11. Authorization

RBAC (Role Based Access Control)

Organization Roles

Owner

Admin

Member

Project Roles

Admin

Developer

Tester

Viewer

Every protected endpoint must verify permissions.

---

# 12. Logging

Every important action should generate an Audit Log.

Examples

Project Created

Feature Created

Feature Enabled

Rollout Updated

Invitation Sent

Invitation Accepted

---

# 13. Redis Rules

Redis is a cache.

MongoDB is the source of truth.

Read Strategy

Redis

↓

MongoDB (Cache Miss)

↓

Redis Update

Write Strategy

MongoDB

↓

Redis Update

Audit Log

---

# 14. Security Guidelines

Never store plain passwords.

Never expose JWT Secret.

Use HTTPS in production.

Validate every request.

Sanitize user input.

Never trust frontend data.

---

# 15. Code Quality Rules

Controllers should be less than 100 lines.

Services should have one responsibility.

Avoid duplicate code.

Prefer reusable utility functions.

Write meaningful variable names.

Avoid magic numbers.

Write comments only when necessary.

---

# 16. Documentation

Whenever a new feature is implemented

Update

API Documentation

ER Diagram (if required)

README

Postman Collection

---

# 17. Testing

Before merging

Backend should compile.

API tested in Postman.

Validation tested.

Authentication tested.

Redis tested.

MongoDB tested.

---

# 18. Development Philosophy

Think before coding.

Keep business logic inside services.

Database logic belongs to repositories.

One module should solve one problem.

Write code for future developers, not just for today.

Readable code is more valuable than clever code.

---

# Team Rule

"We optimize for maintainability over shortcuts."

Every architectural decision should make the project easier to understand, easier to test, and easier to extend.