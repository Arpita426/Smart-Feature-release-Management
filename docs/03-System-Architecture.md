# Product Hierarchy

```mermaid
graph TD

ORG[Organization]

ORG --> USERS[Users]

ORG --> PROJECT[Projects]

PROJECT --> MEMBER[Project Members]

PROJECT --> ENV[Environments]

ENV --> FLAG[Feature Flags]

FLAG --> CONFIG[Feature Configuration]

FLAG --> AUDIT[Audit Logs]
```