-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'CANCELLED', 'EXPIRED', 'SUBMITTED');

-- AlterTable
ALTER TABLE "AssessmentInvitation" ADD COLUMN     "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING';
