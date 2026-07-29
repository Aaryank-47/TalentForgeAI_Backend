export var UserRole;
(function (UserRole) {
    UserRole["CANDIDATE"] = "CANDIDATE";
    UserRole["RECRUITER"] = "RECRUITER";
    UserRole["COMPANY_OWNER"] = "COMPANY_OWNER";
    UserRole["HIRING_MANAGER"] = "HIRING_MANAGER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (UserRole = {}));
export var AccountStatus;
(function (AccountStatus) {
    AccountStatus["PENDING"] = "PENDING";
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["INACTIVE"] = "INACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["BLOCKED"] = "BLOCKED";
    AccountStatus["DELETED"] = "DELETED";
})(AccountStatus || (AccountStatus = {}));
export var JobStatus;
(function (JobStatus) {
    JobStatus["DRAFT"] = "DRAFT";
    JobStatus["PUBLISHED"] = "PUBLISHED";
    JobStatus["PAUSED"] = "PAUSED";
    JobStatus["CLOSED"] = "CLOSED";
    JobStatus["FILLED"] = "FILLED";
    JobStatus["EXPIRED"] = "EXPIRED";
    JobStatus["ARCHIVED"] = "ARCHIVED";
})(JobStatus || (JobStatus = {}));
export var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["APPLIED"] = "APPLIED";
    ApplicationStatus["INREVIEW"] = "INREVIEW";
    ApplicationStatus["WITHDRAWN"] = "WITHDRAWN";
    ApplicationStatus["HIRED"] = "HIRED";
    ApplicationStatus["REJECTED"] = "REJECTED";
})(ApplicationStatus || (ApplicationStatus = {}));
export var InterviewStatus;
(function (InterviewStatus) {
    InterviewStatus["SCHEDULED"] = "SCHEDULED";
    InterviewStatus["RESCHEDULED"] = "RESCHEDULED";
    InterviewStatus["IN_PROGRESS"] = "IN_PROGRESS";
    InterviewStatus["COMPLETED"] = "COMPLETED";
    InterviewStatus["CANCELLED"] = "CANCELLED";
    InterviewStatus["NO_SHOW"] = "NO_SHOW";
})(InterviewStatus || (InterviewStatus = {}));
export var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["ACTIVE"] = "ACTIVE";
    WorkflowStatus["INACTIVE"] = "INACTIVE";
})(WorkflowStatus || (WorkflowStatus = {}));
export var StageType;
(function (StageType) {
    StageType["SYSTEM"] = "SYSTEM";
    StageType["CUSTOM"] = "CUSTOM";
})(StageType || (StageType = {}));
//# sourceMappingURL=all_enums.js.map