-- CreateEnum
CREATE TYPE "ResumeParsingStatus" AS ENUM ('UPLOADED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "parsingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "parsingError" TEXT,
ADD COLUMN     "parsingStartedAt" TIMESTAMP(3),
ADD COLUMN     "parsingStatus" "ResumeParsingStatus" NOT NULL DEFAULT 'UPLOADED',
ADD COLUMN     "rawParsedData" JSONB;

-- CreateIndex
CREATE INDEX "Resume_parsingStatus_idx" ON "Resume"("parsingStatus");
