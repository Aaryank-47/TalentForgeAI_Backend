export enum UserRole {
    CANDIDATE = "CANDIDATE",
    RECRUITER = "RECRUITER",
    COMPANY_OWNER = "COMPANY_OWNER",
    HIRING_MANAGER = "HIRING_MANAGER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}

export enum AccountStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    BLOCKED = "BLOCKED",
    DELETED = "DELETED"
}

export enum JobStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    PAUSED = "PAUSED",
    CLOSED = "CLOSED",
    FILLED = "FILLED",
    EXPIRED = "EXPIRED",
    ARCHIVED = "ARCHIVED"
}

export enum ApplicationStatus {
    APPLIED = "APPLIED",
    INREVIEW = "INREVIEW",
    WITHDRAWN = "WITHDRAWN",
    HIRED = "HIRED",
    REJECTED = "REJECTED"
}

export enum InterviewStatus {
    SCHEDULED = "SCHEDULED",
    RESCHEDULED = "RESCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}

export enum WorkflowStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}

export enum StageType {
    SYSTEM = "SYSTEM",
    CUSTOM = "CUSTOM"
}