/*
  Warnings:

  - The values [SCREENING,SHORTLISTED,INTERVIEW,OFFERED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ApplicationPipeline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pipeline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PipelineHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PipelineStage` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('SYSTEM', 'CUSTOM');

-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('APPLIED', 'INREVIEW', 'WITHDRAWN', 'HIRED', 'REJECTED');
ALTER TABLE "public"."Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'APPLIED';
COMMIT;

-- DropForeignKey
ALTER TABLE "ApplicationPipeline" DROP CONSTRAINT "ApplicationPipeline_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationPipeline" DROP CONSTRAINT "ApplicationPipeline_assignedEmployerId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationPipeline" DROP CONSTRAINT "ApplicationPipeline_pipelineStageId_fkey";

-- DropForeignKey
ALTER TABLE "Pipeline" DROP CONSTRAINT "Pipeline_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Pipeline" DROP CONSTRAINT "Pipeline_jobId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineHistory" DROP CONSTRAINT "PipelineHistory_applicationPipelineId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineHistory" DROP CONSTRAINT "PipelineHistory_fromStageId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineHistory" DROP CONSTRAINT "PipelineHistory_movedByEmployerId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineHistory" DROP CONSTRAINT "PipelineHistory_toStageId_fkey";

-- DropForeignKey
ALTER TABLE "PipelineStage" DROP CONSTRAINT "PipelineStage_pipelineId_fkey";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "workflowId" TEXT;

-- DropTable
DROP TABLE "ApplicationPipeline";

-- DropTable
DROP TABLE "Pipeline";

-- DropTable
DROP TABLE "PipelineHistory";

-- DropTable
DROP TABLE "PipelineStage";

-- DropEnum
DROP TYPE "PipelineStatus";

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageLibrary" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "StageType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStage" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "stageLibraryId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationWorkflow" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "workflowStageId" TEXT NOT NULL,
    "assignedEmployerId" TEXT,
    "remarks" TEXT,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowHistory" (
    "id" TEXT NOT NULL,
    "applicationWorkflowId" TEXT NOT NULL,
    "fromStageId" TEXT,
    "toStageId" TEXT NOT NULL,
    "movedByEmployerId" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workflow_companyId_idx" ON "Workflow"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_companyId_name_key" ON "Workflow"("companyId", "name");

-- CreateIndex
CREATE INDEX "StageLibrary_companyId_idx" ON "StageLibrary"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "StageLibrary_companyId_name_key" ON "StageLibrary"("companyId", "name");

-- CreateIndex
CREATE INDEX "WorkflowStage_workflowId_idx" ON "WorkflowStage"("workflowId");

-- CreateIndex
CREATE INDEX "WorkflowStage_stageLibraryId_idx" ON "WorkflowStage"("stageLibraryId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_workflowId_order_key" ON "WorkflowStage"("workflowId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_workflowId_stageLibraryId_key" ON "WorkflowStage"("workflowId", "stageLibraryId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationWorkflow_applicationId_key" ON "ApplicationWorkflow"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationWorkflow_workflowStageId_idx" ON "ApplicationWorkflow"("workflowStageId");

-- CreateIndex
CREATE INDEX "ApplicationWorkflow_assignedEmployerId_idx" ON "ApplicationWorkflow"("assignedEmployerId");

-- CreateIndex
CREATE INDEX "WorkflowHistory_applicationWorkflowId_idx" ON "WorkflowHistory"("applicationWorkflowId");

-- CreateIndex
CREATE INDEX "WorkflowHistory_fromStageId_idx" ON "WorkflowHistory"("fromStageId");

-- CreateIndex
CREATE INDEX "WorkflowHistory_toStageId_idx" ON "WorkflowHistory"("toStageId");

-- CreateIndex
CREATE INDEX "WorkflowHistory_movedByEmployerId_idx" ON "WorkflowHistory"("movedByEmployerId");

-- CreateIndex
CREATE INDEX "Job_workflowId_idx" ON "Job"("workflowId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageLibrary" ADD CONSTRAINT "StageLibrary_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_stageLibraryId_fkey" FOREIGN KEY ("stageLibraryId") REFERENCES "StageLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationWorkflow" ADD CONSTRAINT "ApplicationWorkflow_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationWorkflow" ADD CONSTRAINT "ApplicationWorkflow_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "WorkflowStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationWorkflow" ADD CONSTRAINT "ApplicationWorkflow_assignedEmployerId_fkey" FOREIGN KEY ("assignedEmployerId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowHistory" ADD CONSTRAINT "WorkflowHistory_applicationWorkflowId_fkey" FOREIGN KEY ("applicationWorkflowId") REFERENCES "ApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowHistory" ADD CONSTRAINT "WorkflowHistory_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowHistory" ADD CONSTRAINT "WorkflowHistory_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "WorkflowStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowHistory" ADD CONSTRAINT "WorkflowHistory_movedByEmployerId_fkey" FOREIGN KEY ("movedByEmployerId") REFERENCES "Employer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
