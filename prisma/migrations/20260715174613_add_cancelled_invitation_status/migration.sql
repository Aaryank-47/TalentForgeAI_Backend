-- AlterEnum
ALTER TYPE "CompanyMemberStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "restoredAt" TIMESTAMP(3),
ADD COLUMN     "restoredBy" TEXT,
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedBy" TEXT,
ADD COLUMN     "suspendedReason" TEXT;
