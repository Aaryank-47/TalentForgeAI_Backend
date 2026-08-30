-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('CURRENT', 'STALE', 'PROCESSING');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "profileVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "requirementsVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "CandidateJobMatch" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "deterministicScore" DOUBLE PRECISION NOT NULL,
    "semanticScore" DOUBLE PRECISION,
    "matchingFactors" JSONB NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'CURRENT',
    "candidateVersion" INTEGER NOT NULL DEFAULT 1,
    "jobVersion" INTEGER NOT NULL DEFAULT 1,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateJobMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateJobMatch_candidateId_matchScore_idx" ON "CandidateJobMatch"("candidateId", "matchScore" DESC);

-- CreateIndex
CREATE INDEX "CandidateJobMatch_jobId_matchScore_idx" ON "CandidateJobMatch"("jobId", "matchScore" DESC);

-- CreateIndex
CREATE INDEX "CandidateJobMatch_candidateId_status_idx" ON "CandidateJobMatch"("candidateId", "status");

-- CreateIndex
CREATE INDEX "CandidateJobMatch_jobId_status_idx" ON "CandidateJobMatch"("jobId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateJobMatch_candidateId_jobId_key" ON "CandidateJobMatch"("candidateId", "jobId");

-- AddForeignKey
ALTER TABLE "CandidateJobMatch" ADD CONSTRAINT "CandidateJobMatch_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateJobMatch" ADD CONSTRAINT "CandidateJobMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
