-- CreateTable
CREATE TABLE "CandidateProject" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateCertification" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateCertification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateProject_candidateId_idx" ON "CandidateProject"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProject_candidateId_fingerprint_key" ON "CandidateProject"("candidateId", "fingerprint");

-- CreateIndex
CREATE INDEX "CandidateCertification_candidateId_idx" ON "CandidateCertification"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateCertification_candidateId_fingerprint_key" ON "CandidateCertification"("candidateId", "fingerprint");

-- AddForeignKey
ALTER TABLE "CandidateProject" ADD CONSTRAINT "CandidateProject_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateCertification" ADD CONSTRAINT "CandidateCertification_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
