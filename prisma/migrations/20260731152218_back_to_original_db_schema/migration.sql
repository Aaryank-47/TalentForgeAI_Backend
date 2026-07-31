-- DropForeignKey
ALTER TABLE "WorkflowHistory" DROP CONSTRAINT "WorkflowHistory_movedByEmployerId_fkey";

-- AlterTable
ALTER TABLE "WorkflowHistory" ALTER COLUMN "movedByEmployerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkflowHistory" ADD CONSTRAINT "WorkflowHistory_movedByEmployerId_fkey" FOREIGN KEY ("movedByEmployerId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
