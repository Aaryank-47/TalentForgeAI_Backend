-- AlterTable
ALTER TABLE "QuestionCategory" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "QuestionCategory_deletedAt_idx" ON "QuestionCategory"("deletedAt");
