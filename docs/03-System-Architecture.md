# System Architecture

```mermaid
graph TD

A[Organization]

A --> B[Members]
A --> C[Projects]

C --> D[Environments]

D --> E[Feature Flags]
D --> F[Audit Logs]
```