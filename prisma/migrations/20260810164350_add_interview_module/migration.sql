-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('AI', 'NORMAL');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('INDIVIDUAL', 'GROUP');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InterviewSessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InterviewAssignmentCreationSource" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "InterviewParticipantType" AS ENUM ('CANDIDATE', 'INTERVIEWER');

-- AlterTable
ALTER TABLE "WorkflowStage" ADD COLUMN     "interviewId" TEXT;

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "type" "InterviewType" NOT NULL,
    "mode" "InterviewMode" NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'DRAFT',
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobInterview" (
    "jobId" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobInterview_pkey" PRIMARY KEY ("jobId","interviewId")
);

-- CreateTable
CREATE TABLE "InterviewAssignment" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "creationSource" "InterviewAssignmentCreationSource" NOT NULL,
    "assignedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "status" "InterviewSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "roomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSessionParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantType" "InterviewParticipantType" NOT NULL,
    "assignmentId" TEXT,
    "companyMemberId" TEXT,
    "hasJoined" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInterviewConfiguration" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "systemPrompt" TEXT,
    "evaluationMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInterviewConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interview_companyId_idx" ON "Interview"("companyId");

-- CreateIndex
CREATE INDEX "Interview_createdById_idx" ON "Interview"("createdById");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- CreateIndex
CREATE INDEX "JobInterview_jobId_idx" ON "JobInterview"("jobId");

-- CreateIndex
CREATE INDEX "JobInterview_interviewId_idx" ON "JobInterview"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewAssignment_interviewId_idx" ON "InterviewAssignment"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewAssignment_applicationId_idx" ON "InterviewAssignment"("applicationId");

-- CreateIndex
CREATE INDEX "InterviewAssignment_assignedById_idx" ON "InterviewAssignment"("assignedById");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewAssignment_interviewId_applicationId_key" ON "InterviewAssignment"("interviewId", "applicationId");

-- CreateIndex
CREATE INDEX "InterviewSession_interviewId_idx" ON "InterviewSession"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewSession_status_idx" ON "InterviewSession"("status");

-- CreateIndex
CREATE INDEX "InterviewSession_scheduledAt_idx" ON "InterviewSession"("scheduledAt");

-- CreateIndex
CREATE INDEX "InterviewSessionParticipant_sessionId_idx" ON "InterviewSessionParticipant"("sessionId");

-- CreateIndex
CREATE INDEX "InterviewSessionParticipant_assignmentId_idx" ON "InterviewSessionParticipant"("assignmentId");

-- CreateIndex
CREATE INDEX "InterviewSessionParticipant_companyMemberId_idx" ON "InterviewSessionParticipant"("companyMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewSessionParticipant_sessionId_assignmentId_key" ON "InterviewSessionParticipant"("sessionId", "assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewSessionParticipant_sessionId_companyMemberId_key" ON "InterviewSessionParticipant"("sessionId", "companyMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "AIInterviewConfiguration_interviewId_key" ON "AIInterviewConfiguration"("interviewId");

-- CreateIndex
CREATE INDEX "AIInterviewConfiguration_interviewId_idx" ON "AIInterviewConfiguration"("interviewId");

-- CreateIndex
CREATE INDEX "WorkflowStage_interviewId_idx" ON "WorkflowStage"("interviewId");

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CompanyMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobInterview" ADD CONSTRAINT "JobInterview_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobInterview" ADD CONSTRAINT "JobInterview_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAssignment" ADD CONSTRAINT "InterviewAssignment_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAssignment" ADD CONSTRAINT "InterviewAssignment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAssignment" ADD CONSTRAINT "InterviewAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "CompanyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSessionParticipant" ADD CONSTRAINT "InterviewSessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSessionParticipant" ADD CONSTRAINT "InterviewSessionParticipant_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "InterviewAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSessionParticipant" ADD CONSTRAINT "InterviewSessionParticipant_companyMemberId_fkey" FOREIGN KEY ("companyMemberId") REFERENCES "CompanyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInterviewConfiguration" ADD CONSTRAINT "AIInterviewConfiguration_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
