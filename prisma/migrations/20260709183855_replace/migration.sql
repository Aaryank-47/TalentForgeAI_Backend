/*
  Warnings:

  - You are about to drop the column `phone` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Employer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "phone",
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "phone",
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "phone",
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Employer" DROP COLUMN "phone",
ADD COLUMN     "phoneNumber" TEXT;
