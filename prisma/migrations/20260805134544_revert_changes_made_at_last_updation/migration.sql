/*
  Warnings:

  - The primary key for the `JobAssessment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `displayOrder` on the `JobAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `JobAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `isMandatory` on the `JobAssessment` table. All the data in the column will be lost.
  - The primary key for the `WorkflowStageAssessment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `WorkflowStageAssessment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sectionId,displayOrder]` on the table `AssessmentSectionItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AssessmentSectionItem_sectionId_questionId_key";

-- DropIndex
DROP INDEX "JobAssessment_jobId_assessmentId_key";

-- DropIndex
DROP INDEX "WorkflowStageAssessment_workflowStageId_assessmentId_key";

-- AlterTable
ALTER TABLE "JobAssessment" DROP CONSTRAINT "JobAssessment_pkey",
DROP COLUMN "displayOrder",
DROP COLUMN "id",
DROP COLUMN "isMandatory",
ADD CONSTRAINT "JobAssessment_pkey" PRIMARY KEY ("jobId", "assessmentId");

-- AlterTable
ALTER TABLE "WorkflowStageAssessment" DROP CONSTRAINT "WorkflowStageAssessment_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "WorkflowStageAssessment_pkey" PRIMARY KEY ("workflowStageId", "assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSectionItem_sectionId_displayOrder_key" ON "AssessmentSectionItem"("sectionId", "displayOrder");
