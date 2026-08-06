/*
  Warnings:

  - You are about to drop the `WorkflowStageAssessment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkflowStageAssessment" DROP CONSTRAINT "WorkflowStageAssessment_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowStageAssessment" DROP CONSTRAINT "WorkflowStageAssessment_workflowStageId_fkey";

-- AlterTable
ALTER TABLE "WorkflowStage" ADD COLUMN     "assessmentId" TEXT;

-- DropTable
DROP TABLE "WorkflowStageAssessment";

-- CreateIndex
CREATE INDEX "WorkflowStage_assessmentId_idx" ON "WorkflowStage"("assessmentId");

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
