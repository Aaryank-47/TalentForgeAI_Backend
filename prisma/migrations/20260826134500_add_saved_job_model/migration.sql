-- CreateTable
CREATE TABLE IF NOT EXISTS "SavedJob" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SavedJob_candidateId_jobId_key" ON "SavedJob"("candidateId", "jobId");
CREATE INDEX IF NOT EXISTS "SavedJob_candidateId_idx" ON "SavedJob"("candidateId");
CREATE INDEX IF NOT EXISTS "SavedJob_jobId_idx" ON "SavedJob"("jobId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'SavedJob_candidateId_fkey'
    ) THEN
        ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'SavedJob_jobId_fkey'
    ) THEN
        ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
