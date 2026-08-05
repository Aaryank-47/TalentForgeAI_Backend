/*
  Warnings:

  - Added the required column `displayOrder` to the `JobAssessment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobAssessment" ADD COLUMN     "displayOrder" INTEGER NOT NULL,
ADD COLUMN     "isMandatory" BOOLEAN NOT NULL DEFAULT true;
