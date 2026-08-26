-- AlterTable: Add updatedAt column to Resume if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Resume' AND column_name = 'updatedAt'
    ) THEN 
        ALTER TABLE "Resume" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- CreateTable: ApplicationResume if not exists
CREATE TABLE IF NOT EXISTS "ApplicationResume" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "sourceResumeId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationResume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on ApplicationResume before data migration so unique constraints exist
CREATE UNIQUE INDEX IF NOT EXISTS "ApplicationResume_applicationId_key" ON "ApplicationResume"("applicationId");
CREATE INDEX IF NOT EXISTS "ApplicationResume_sourceResumeId_idx" ON "ApplicationResume"("sourceResumeId");

-- Data Migration: Migrate existing Application.resumeId records to ApplicationResume snapshots
-- For all existing applications with a resumeId, copy the resume details into ApplicationResume
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Application' AND column_name = 'resumeId'
    ) THEN
        INSERT INTO "ApplicationResume" ("id", "applicationId", "sourceResumeId", "fileName", "fileUrl", "fileSize", "createdAt")
        SELECT 
            'app_res_' || a.id,
            a.id,
            a."resumeId",
            COALESCE(r."resumeName", 'Resume.pdf'),
            COALESCE(r."resumeUrl", ''),
            COALESCE(r."fileSize", 0),
            a."appliedAt"
        FROM "Application" a
        LEFT JOIN "Resume" r ON a."resumeId" = r.id
        WHERE a."resumeId" IS NOT NULL
        ON CONFLICT ("applicationId") DO NOTHING;

        -- DropForeignKey
        ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_resumeId_fkey";

        -- AlterTable: Drop resumeId column from Application safely after data migration
        ALTER TABLE "Application" DROP COLUMN "resumeId";
    END IF;
END $$;

-- CreateIndex on Resume
CREATE INDEX IF NOT EXISTS "Resume_candidateId_deletedAt_idx" ON "Resume"("candidateId", "deletedAt");

-- AddForeignKey constraints if they don't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ApplicationResume_applicationId_fkey'
    ) THEN
        ALTER TABLE "ApplicationResume" ADD CONSTRAINT "ApplicationResume_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ApplicationResume_sourceResumeId_fkey'
    ) THEN
        ALTER TABLE "ApplicationResume" ADD CONSTRAINT "ApplicationResume_sourceResumeId_fkey" FOREIGN KEY ("sourceResumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
