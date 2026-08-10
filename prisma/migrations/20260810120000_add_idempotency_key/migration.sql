-- AlterTable
ALTER TABLE "AssessmentInvitation" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentInvitation_idempotencyKey_key" ON "AssessmentInvitation"("idempotencyKey");
