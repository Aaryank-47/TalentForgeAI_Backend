/*
  Warnings:

  - You are about to drop the column `employerId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `maximumExperience` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `minimumExperience` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Job` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jobId,candidateId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Made the column `candidateId` on table `Application` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `createdById` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employmentType` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workplaceType` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Made the column `companyId` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'FILLED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE', 'TEMPORARY', 'APPRENTICESHIP');

-- CreateEnum
CREATE TYPE "WorkplaceType" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "JobVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'INTERNAL');

-- CreateEnum
CREATE TYPE "SalaryPeriod" AS ENUM ('HOURLY', 'MONTHLY', 'YEARLY');

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_employerId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "jobId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "candidateId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "employerId",
DROP COLUMN "maximumExperience",
DROP COLUMN "minimumExperience",
DROP COLUMN "type",
ADD COLUMN     "applicationDeadline" TIMESTAMP(3),
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "employmentType" "EmploymentType" NOT NULL,
ADD COLUMN     "hideSalary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "maxExperience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "minExperience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "salaryPeriod" "SalaryPeriod",
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "updatedById" TEXT,
ADD COLUMN     "vacancies" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "visibility" "JobVisibility" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "workplaceType" "WorkplaceType" NOT NULL,
ALTER COLUMN "companyId" SET NOT NULL;

-- DropEnum
DROP TYPE "JobType";

-- CreateTable
CREATE TABLE "JobSkill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobBenefit" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "benefit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobMember" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "companyMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobSkill_jobId_idx" ON "JobSkill"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSkill_jobId_name_key" ON "JobSkill"("jobId", "name");

-- CreateIndex
CREATE INDEX "JobBenefit_jobId_idx" ON "JobBenefit"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "JobBenefit_jobId_benefit_key" ON "JobBenefit"("jobId", "benefit");

-- CreateIndex
CREATE INDEX "JobMember_jobId_idx" ON "JobMember"("jobId");

-- CreateIndex
CREATE INDEX "JobMember_companyMemberId_idx" ON "JobMember"("companyMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "JobMember_jobId_companyMemberId_key" ON "JobMember"("jobId", "companyMemberId");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobId_candidateId_key" ON "Application"("jobId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_employmentType_idx" ON "Job"("employmentType");

-- CreateIndex
CREATE INDEX "Job_workplaceType_idx" ON "Job"("workplaceType");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBenefit" ADD CONSTRAINT "JobBenefit_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMember" ADD CONSTRAINT "JobMember_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMember" ADD CONSTRAINT "JobMember_companyMemberId_fkey" FOREIGN KEY ("companyMemberId") REFERENCES "CompanyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
