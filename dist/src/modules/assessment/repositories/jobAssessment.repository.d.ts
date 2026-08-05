import type { Job, Assessment, CompanyMember } from "@prisma/client";
export declare class JobAssessmentRepository {
    static findJobById(jobId: string): Promise<Job | null>;
    static findActiveCompanyMember(userId: string, companyId: string): Promise<CompanyMember | null>;
    static findAssessmentById(assessmentId: string): Promise<Assessment | null>;
    static attachAssessmentsToJob(jobId: string, jobCompanyId: string, assessments: {
        assessmentId: string;
        displayOrder: number;
        isMandatory: boolean;
    }[]): Promise<number>;
}
//# sourceMappingURL=jobAssessment.repository.d.ts.map