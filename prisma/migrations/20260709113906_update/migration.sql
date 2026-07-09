/*
  Warnings:

  - You are about to drop the column `isActive` on the `CompanyMember` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CompanyMemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'LEFT', 'REMOVED');

-- AlterTable
ALTER TABLE "CompanyMember" DROP COLUMN "isActive",
ADD COLUMN     "invitedBy" TEXT,
ADD COLUMN     "status" "CompanyMemberStatus" NOT NULL DEFAULT 'ACTIVE';
