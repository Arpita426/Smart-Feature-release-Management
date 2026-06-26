User

- Full Name
- Email 
- Password (Hashed) 
- Avatar (optional)
- IsEmailVerified
- LastLogin
- CreatedAt
- UpdatedAt

Organization

- Name
- Logo
- OwnerId
- CreatedAt
- UpdatedAt

Project

- Name
- Description
- OrganizationId
- CreatedBy
- Visibility
- CreatedAt
- UpdatedAt

ProjectAPIKey

- ProjectId
- Key
- Secret
- Status
- CreatedAt

ProjectMember

- UserId
- ProjectId
- Role
    - Owner
    - Admin
    - Developer
    - Tester
    - Viewer
- InvitedBy
- JoinedAt
- Status
    - Pending
    - Accepted
    - Revoked

Environment

- Name
- ProjectId
- Description
- CreatedAt

FeatureFlag

- Name
- Key
- Description
- Tags
- OwnerId
- ProjectId
- Status
    - Draft
    - Active
    - Archived
- CreatedBy
- CreatedAt
- UpdatedAt

FeatureConfiguration

- FeatureFlagId
- EnvironmentId
- Enabled
- RolloutPercentage
- TargetingRules
- ExpiryDate
- Version
- UpdatedBy
- UpdatedAt

AuditLog

- UserId
- ProjectId
- FeatureFlagId
- Action
- OldValue
- NewValue
- Timestamp

Invitation

- InvitationId
- OrganizationId
- ProjectId
- Email
- Role
- InvitedBy
- InvitationToken
- Status
    - Pending
    - Accepted
    - Expired
    - Cancelled
- ExpiryDate
- CreatedAt
- AcceptedAt