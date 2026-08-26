import { ApplicationWorkflowRepository } from "../repositories/application-workflow.repository.js";
import { ApplicationRepository } from "../../application/repositories/application.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { JobsRepository } from "../../jobs/repository/jobs.repository.js";
import { JobAssessmentRepository } from "../../assessment/repositories/assessmentAssignment.repository.js";
import { JobStatus } from "@prisma/client";
import type { ApplicationWorkflow } from "@prisma/client";
import { WorkflowRepository } from "../repositories/workflow.repository.js";
import type { HiringBoardView } from "../interfaces/hiring-workflow.interface.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { EmailService } from "../../../common/email/email.service.js";
import { emailTemplates } from "../../../common/email/email.templates.js";

export class ApplicationWorkflowService {
    static async createApplicationWorkflow(
        applicationId: string,
        workflowStageId: string,
        movedByUserId?: string
    ): Promise<any> {
        const application = await ApplicationRepository.getAppliationById(applicationId);
        if (!application) {
            throw new NotFoundError("Application not found")
        }

        const workflowStage = await ApplicationWorkflowRepository.getWorkflowStageById(workflowStageId);
        if (!workflowStage) {
            throw new NotFoundError("Application stage not found")
        }

        const existingApplicationWorkflow = await ApplicationWorkflowRepository.getApplicationWorkflowByApplicationId(applicationId);
        if (existingApplicationWorkflow) {
            throw new ConflictError("Application workflow already exists")
        }

        if (application.job.workflowId !== workflowStage.workflowId) {
            throw new BadRequestError("The workflow stage does not belong to the application's workflow");
        }

        let movedByEmployerId: string | undefined = undefined;
        if (movedByUserId) {
            const employer = await AuthRepository.findEmployerByUserId(movedByUserId);
            if (employer) {
                movedByEmployerId = employer.id;
            }
        }

        return await ApplicationWorkflowRepository.createApplicationWorkflow({
            applicationId,
            workflowStageId,
            ...(movedByEmployerId ? { movedByEmployerId } : {})
        });
    }

    static async getHiringBoard(
        jobId: string
    ): Promise<HiringBoardView[]> {
        const job = await JobsRepository.findJobById(jobId);
        if (!job) {
            throw new NotFoundError("Job not found")
        }
        if (job.status != JobStatus.PUBLISHED) {
            throw new BadRequestError("Job is not in PUBLISHED state");
        }

        if (!job.workflowId) {
            throw new NotFoundError("No workflow is assigned to this job");
        }

        const jobWorkflow = await WorkflowRepository.getWorkflowById(job.workflowId);
        if (!jobWorkflow) {
            throw new NotFoundError("Workflow not found");
        }

        const workflowStagesData = await WorkflowRepository.getWorkflowStagesByWorkflowId(job.workflowId)
        if (!workflowStagesData || !workflowStagesData.stages) {
            throw new NotFoundError("No workflow stages found for this job")
        }

        const stages = workflowStagesData.stages;

        // Fetch all applications (includes applicationWorkflow relation pre-fetched)
        const applications = await ApplicationRepository.getJobApplicationByJobId(jobId);

        // Fetch any job-level assessments
        const jobAssessments = await JobAssessmentRepository.findJobAssessmentsByJobId(jobId);
        const defaultJobAssessment = jobAssessments[0]?.assessment;

        // Construct the hiring board structure (stages ordered by order asc)
        const board = stages.map((stage: any) => {
            const isAssessmentStage = stage.stageLibrary?.type === "ASSESSMENT" || 
                                     stage.stageLibrary?.type === "TECH_ASSESSMENT" ||
                                     stage.stageLibrary?.name?.toLowerCase().includes("assessment");

            const resolvedAssessmentId = stage.assessmentId || (isAssessmentStage ? defaultJobAssessment?.id : null);
            const resolvedAssessment = stage.assessment ? {
                id: stage.assessment.id,
                title: stage.assessment.title,
                status: stage.assessment.status,
            } : (isAssessmentStage && defaultJobAssessment ? {
                id: defaultJobAssessment.id,
                title: defaultJobAssessment.title,
                status: defaultJobAssessment.status,
            } : null);

            return {
                stageId: stage.id,
                stageName: stage.stageLibrary.name,
                order: stage.order,
                assessmentId: resolvedAssessmentId,
                assessment: resolvedAssessment,
                applications: [] as any[]
            };
        });

        // Map applications to their respective workflow stages
        for (const app of applications) {
            const workflowStageId = app.applicationWorkflow?.workflowStageId;
            const stageInBoard = board.find((s: any) => s.stageId === workflowStageId);
            const appPayload = {
                id: app.id,
                candidateId: app.candidateId,
                status: app.status,
                appliedAt: app.appliedAt,
                candidate: app.candidate,
                assessmentInvitations: (app as any).assessmentInvitations || [],
                assessmentAttempts: (app as any).assessmentAttempts || []
            };

            if (stageInBoard) {
                stageInBoard.applications.push(appPayload);
            } else {
                // Fallback: place in the first stage of the workflow if no workflow stage is found
                if (board.length > 0) {
                    board[0].applications.push(appPayload);
                }
            }
        }

        return board;
    }

    static async moveApplicationToNextStage(
        movedByUserId: string,
        applicationId: string,
        toworkflowStageId: string,
        remarks?: string,
        assignedTo?: string,
        nextRoundDate?: string
    ): Promise<ApplicationWorkflow> {
        const movedByEmployer = await AuthRepository.findEmployerByUserId(movedByUserId);
        if (!movedByEmployer) {
            throw new NotFoundError("Employer profile not found for the current user");
        }

        const application = await ApplicationRepository.getAppliationById(applicationId);
        if (!application) {
            throw new NotFoundError("Application not found");
        }

        const nextWorkflowStage = await ApplicationWorkflowRepository.getWorkflowStageById(toworkflowStageId);
        if (!nextWorkflowStage) {
            throw new NotFoundError("Application stage not found");
        }

        if (application.job.workflowId !== nextWorkflowStage.workflowId) {
            throw new BadRequestError("The workflow stage does not belong to the application's workflow");
        }

        let assignedEmployerId: string | null = null;
        if (assignedTo) {
            const assignedEmployer = await AuthRepository.findEmployerByUserId(assignedTo);
            if (!assignedEmployer) {
                throw new NotFoundError("Assigned employer profile not found");
            }
            const isMember = await CompanyRepository.findMemberByUserAndCompany(assignedTo, application.job.companyId);
            if (!isMember) {
                throw new BadRequestError("Assigned user is not a member of this company");
            }
            assignedEmployerId = assignedEmployer.id;
        }

        const applicationWorkflow = await ApplicationWorkflowRepository.getApplicationWorkflowByApplicationId(applicationId);
        if (!applicationWorkflow) {
            throw new NotFoundError("Application workflow not found");
        }
        const fromStageId = applicationWorkflow.workflowStageId;

        const updatedWorkflow = await ApplicationWorkflowRepository.updateApplicationWorkflow(
            movedByEmployer.id,
            applicationId,
            fromStageId,
            toworkflowStageId,
            remarks,
            assignedEmployerId || undefined
        );

        // Send automated stage update email
        const candidateEmail = (application as any).candidate?.user?.email;
        const candidateName = (application as any).candidate?.fullName;
        const companyName = (application as any).job?.company?.companyName || "Company";
        const companyEmail = (application as any).job?.company?.companyEmail;
        const nextStageName = (nextWorkflowStage as any).stageLibrary?.name || "Next Stage";
        
        const hrEmail = (movedByEmployer as any).user?.email;
        const fromEmail = companyEmail || hrEmail;
        const fromString = fromEmail ? `"${companyName}" <${fromEmail}>` : undefined;
        const replyToString = fromEmail ? `"${companyName}" <${fromEmail}>` : undefined;

        if (candidateEmail && candidateName) {
            const emailTemplate = emailTemplates.stageUpdateTemplate(
                candidateName,
                companyName,
                nextStageName,
                nextRoundDate
            );

            EmailService.sendEmail({
                to: candidateEmail,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                ...(emailTemplate.text ? { text: emailTemplate.text } : {}),
                ...(fromString ? { from: fromString } : {}),
                ...(replyToString ? { replyTo: replyToString } : {})
            }).catch((err) => {
                console.error("Failed to send stage update email to candidate:", err);
            });
        }

        return updatedWorkflow;
    }

    static async bulkMoveApplicationsToNextStage(
        movedByUserId: string,
        applicationIds: string[],
        toworkflowStageId: string,
        remarks?: string,
        assignedTo?: string,
        nextRoundDate?: string
    ): Promise<ApplicationWorkflow[]> {
        if (applicationIds.length === 0) {
            throw new BadRequestError("At least one application ID is required");
        }

        // Resolve all shared/static data upfront in parallel (3 queries max) ──
        const [movedByEmployer, nextWorkflowStage, applications] = await Promise.all([
            AuthRepository.findEmployerByUserId(movedByUserId),
            ApplicationWorkflowRepository.getWorkflowStageById(toworkflowStageId),
            ApplicationRepository.getApplicationsByIds(applicationIds),
        ]);

        if (!movedByEmployer) {
            throw new NotFoundError("Employer profile not found for the current user");
        }
        if (!nextWorkflowStage) {
            throw new NotFoundError("Target workflow stage not found");
        }

        // Validate all applications exist and belong to the correct workflow ──
        const foundIds = new Set(applications.map((a) => a.id));
        const missingIds = applicationIds.filter((id) => !foundIds.has(id));
        if (missingIds.length > 0) {
            throw new NotFoundError(`Applications not found: ${missingIds.join(", ")}`);
        }

        const invalidWorkflowApp = applications.find(
            (a) => a.job.workflowId !== nextWorkflowStage.workflowId
        );
        if (invalidWorkflowApp) {
            throw new BadRequestError(
                `Application ${invalidWorkflowApp.id} does not belong to the same workflow as the target stage`
            );
        }

        // Resolve optional assignedTo employer (1 query) ──
        let assignedEmployerId: string | null = null;
        if (assignedTo) {
            // All applications share one company (validated above), so check membership once
            const firstApp = applications[0]!;
            const companyId = firstApp.job.companyId;
            const [assignedEmployer, isMember] = await Promise.all([
                AuthRepository.findEmployerByUserId(assignedTo),
                CompanyRepository.findMemberByUserAndCompany(assignedTo, companyId),
            ]);
            if (!assignedEmployer) {
                throw new NotFoundError("Assigned employer profile not found");
            }
            if (!isMember) {
                throw new BadRequestError("Assigned user is not a member of this company");
            }
            assignedEmployerId = assignedEmployer.id;
        }

        // Fetch all current application workflows in ONE batch query ──
        const existingWorkflows = await ApplicationWorkflowRepository.getApplicationWorkflowsByApplicationIds(applicationIds);
        const workflowMap = new Map(existingWorkflows.map((aw) => [aw.applicationId, aw]));

        const missingWorkflows = applicationIds.filter((id) => !workflowMap.has(id));
        if (missingWorkflows.length > 0) {
            throw new NotFoundError(`Application workflows not found for: ${missingWorkflows.join(", ")}`);
        }

        //Build items and execute ONE transaction (updateMany + createMany) ──
        const items = applicationIds.map((applicationId) => {
            const aw = workflowMap.get(applicationId)!;
            return {
                applicationId,
                fromStageId: aw.workflowStageId,
                applicationWorkflowId: aw.id,
            };
        });

        const updatedWorkflows = await ApplicationWorkflowRepository.bulkUpdateApplicationWorkflows({
            movedByEmployerId: movedByEmployer.id,
            toStageId: toworkflowStageId,
            ...(remarks ? { comment: remarks } : {}),
            ...(assignedEmployerId ? { assignedTo: assignedEmployerId } : {}),
            items,
        });

        // Send automated stage update emails to all candidates
        const companyName = (applications[0] as any)?.job?.company?.companyName || "Company";
        const companyEmail = (applications[0] as any)?.job?.company?.companyEmail;
        const nextStageName = (nextWorkflowStage as any).stageLibrary?.name || "Next Stage";
        
        const hrEmail = (movedByEmployer as any).user?.email;
        const fromEmail = companyEmail || hrEmail;
        const fromString = fromEmail ? `"${companyName}" <${fromEmail}>` : undefined;
        const replyToString = fromEmail ? `"${companyName}" <${fromEmail}>` : undefined;

        for (const app of applications) {
            const candidateEmail = (app as any).candidate?.user?.email;
            const candidateName = (app as any).candidate?.fullName;

            if (candidateEmail && candidateName) {
                const emailTemplate = emailTemplates.stageUpdateTemplate(
                    candidateName,
                    companyName,
                    nextStageName,
                    nextRoundDate
                );

                EmailService.sendEmail({
                    to: candidateEmail,
                    subject: emailTemplate.subject,
                    html: emailTemplate.html,
                    ...(emailTemplate.text ? { text: emailTemplate.text } : {}),
                    ...(fromString ? { from: fromString } : {}),
                    ...(replyToString ? { replyTo: replyToString } : {})
                }).catch((err) => {
                    console.error(`Failed to send bulk stage update email to candidate ${candidateName}:`, err);
                });
            }
        }

        return updatedWorkflows;
    }

    static async getCandidateWorkflow(
        applicationId: string
    ): Promise<{
        currentStage: string;
        stages: Array<{
            name: string;
            status: string;
        }>;
    }> {
        const appWorkflow = await ApplicationWorkflowRepository.getApplicationWorkflowWithStages(applicationId);
        if (!appWorkflow) {
            throw new NotFoundError("Application workflow not found");
        }

        const job = appWorkflow.application.job;
        if (!job.workflow) {
            throw new NotFoundError("No workflow is assigned to this job");
        }

        const stages = job.workflow.stages as any[];
        const currentStageId = appWorkflow.workflowStageId;

        // Find current stage index to determine status of stages based on order
        const currentStageIndex = stages.findIndex((s) => s.id === currentStageId);

        let currentStageName = "";
        const formattedStages = stages.map((stage, index) => {
            let status = "PENDING";
            if (stage.id === currentStageId) {
                status = "CURRENT";
                currentStageName = stage.stageLibrary.name;
            } else if (currentStageIndex !== -1 && index < currentStageIndex) {
                status = "COMPLETED";
            }
            return {
                name: stage.stageLibrary.name,
                status
            };
        });

        return {
            currentStage: currentStageName || "Unknown",
            stages: formattedStages
        };
    }

    static async getWorkflowHistory(
        applicationId: string
    ): Promise<{
        history: Array<{
            stage: string;
            action: string;
            performedBy: string;
            remarks: string;
            createdAt: Date;
        }>;
    }> {
        const appWorkflow = await ApplicationWorkflowRepository.getApplicationWorkflowByApplicationId(applicationId);
        if (!appWorkflow) {
            throw new NotFoundError("Application workflow not found");
        }

        const historyItems = await ApplicationWorkflowRepository.getWorkflowHistoryByWorkflowId(appWorkflow.id);

        const formattedHistory = historyItems.map((item) => {
            let action = "MOVED";
            if (!item.fromStageId) {
                action = "ENTERED";
            }

            let performedBy = "Candidate";
            if (item.movedByEmployerId && item.movedBy) {
                performedBy = item.movedBy.fullName;
            }

            return {
                stage: item.toStage.stageLibrary.name,
                action,
                performedBy,
                remarks: item.comment ?? "",
                createdAt: item.createdAt
            };
        });

        return {
            history: formattedHistory
        };
    }
}