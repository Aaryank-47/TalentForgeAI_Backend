/*
  Warnings:

  - The primary key for the `JobAssessment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WorkflowStageAssessment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[sectionId,questionId]` on the table `AssessmentSectionItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobId,assessmentId]` on the table `JobAssessment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workflowStageId,assessmentId]` on the table `WorkflowStageAssessment` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `JobAssessment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `WorkflowStageAssessment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "AssessmentSectionItem_sectionId_displayOrder_key";

-- AlterTable
ALTER TABLE "JobAssessment" DROP CONSTRAINT "JobAssessment_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "JobAssessment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "WorkflowStageAssessment" DROP CONSTRAINT "WorkflowStageAssessment_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "WorkflowStageAssessment_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSectionItem_sectionId_questionId_key" ON "AssessmentSectionItem"("sectionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "JobAssessment_jobId_assessmentId_key" ON "JobAssessment"("jobId", "assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStageAssessment_workflowStageId_assessmentId_key" ON "WorkflowStageAssessment"("workflowStageId", "assessmentId");
