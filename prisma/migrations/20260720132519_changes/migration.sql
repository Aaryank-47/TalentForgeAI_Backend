/*
  Warnings:

  - You are about to drop the column `profileCompleted` on the `Candidate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[candidateId,name]` on the table `CandidateSkill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `collegeName` to the `CandidateEducation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `degree` to the `CandidateEducation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fieldOfStudy` to the `CandidateEducation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gradingSystem` to the `CandidateEducation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `CandidateEducation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CandidateEducation` table without a default value. This is not possible if the table is not empty.
  - Made the column `candidateId` on table `CandidateEducation` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `companyName` to the `CandidateExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `designation` to the `CandidateExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employmentType` to the `CandidateExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `CandidateExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CandidateExperience` table without a default value. This is not possible if the table is not empty.
  - Made the column `candidateId` on table `CandidateExperience` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `CandidateSkill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CandidateSkill` table without a default value. This is not possible if the table is not empty.
  - Made the column `candidateId` on table `CandidateSkill` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `fileSize` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resumeName` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resumeUrl` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Made the column `candidateId` on table `Resume` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GradingSystem" AS ENUM ('PERCENTAGE', 'CGPA', 'GPA_4', 'GPA_5', 'GPA_10', 'LETTER_GRADE', 'PASS_FAIL', 'OTHER');

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateEducation" DROP CONSTRAINT "CandidateEducation_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateExperience" DROP CONSTRAINT "CandidateExperience_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateSkill" DROP CONSTRAINT "CandidateSkill_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_candidateId_fkey";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "profileCompleted",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "profileCompletion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CandidateEducation" ADD COLUMN     "collegeName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentlyStudying" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "degree" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "fieldOfStudy" TEXT NOT NULL,
ADD COLUMN     "grade" DOUBLE PRECISION,
ADD COLUMN     "gradeText" TEXT,
ADD COLUMN     "gradingSystem" "GradingSystem" NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "candidateId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CandidateExperience" ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentlyWorking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "designation" TEXT NOT NULL,
ADD COLUMN     "employmentType" "EmploymentType" NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "candidateId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CandidateSkill" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "yearsOfExperience" DOUBLE PRECISION,
ALTER COLUMN "candidateId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "resumeName" TEXT NOT NULL,
ADD COLUMN     "resumeUrl" TEXT NOT NULL,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "candidateId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Candidate_experienceLevel_idx" ON "Candidate"("experienceLevel");

-- CreateIndex
CREATE INDEX "Candidate_currentLocation_idx" ON "Candidate"("currentLocation");

-- CreateIndex
CREATE INDEX "Candidate_isOpenToWork_idx" ON "Candidate"("isOpenToWork");

-- CreateIndex
CREATE INDEX "CandidateEducation_candidateId_idx" ON "CandidateEducation"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateExperience_candidateId_idx" ON "CandidateExperience"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateExperience_companyName_idx" ON "CandidateExperience"("companyName");

-- CreateIndex
CREATE INDEX "CandidateSkill_candidateId_idx" ON "CandidateSkill"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateSkill_candidateId_name_key" ON "CandidateSkill"("candidateId", "name");

-- CreateIndex
CREATE INDEX "Resume_candidateId_idx" ON "Resume"("candidateId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateEducation" ADD CONSTRAINT "CandidateEducation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateExperience" ADD CONSTRAINT "CandidateExperience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
