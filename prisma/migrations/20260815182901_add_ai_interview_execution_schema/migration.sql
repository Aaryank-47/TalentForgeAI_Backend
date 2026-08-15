-- CreateEnum
CREATE TYPE "AIRecommendation" AS ENUM ('STRONG_HIRE', 'HIRE', 'HOLD', 'REJECT', 'STRONG_REJECT');

-- DropIndex
DROP INDEX "AIInterviewConfiguration_interviewId_idx";

-- AlterTable
ALTER TABLE "AIInterviewConfiguration" ADD COLUMN     "allowFollowUps" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "questionCount" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "AIInterviewQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "topic" TEXT,
    "skill" TEXT,
    "difficulty" "QuestionDifficulty",
    "expectedAreas" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentAIQuestionId" TEXT,

    CONSTRAINT "AIInterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInterviewAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInterviewAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInterviewEvaluation" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "technicalAccuracy" DOUBLE PRECISION,
    "relevance" DOUBLE PRECISION,
    "completeness" DOUBLE PRECISION,
    "communication" DOUBLE PRECISION,
    "feedback" TEXT,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInterviewEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInterviewResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "technicalScore" DOUBLE PRECISION,
    "communicationScore" DOUBLE PRECISION,
    "problemSolvingScore" DOUBLE PRECISION,
    "overallFeedback" TEXT,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "recommendation" "AIRecommendation",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInterviewResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIInterviewQuestion_parentAIQuestionId_idx" ON "AIInterviewQuestion"("parentAIQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "AIInterviewQuestion_sessionId_sequence_key" ON "AIInterviewQuestion"("sessionId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "AIInterviewAnswer_questionId_key" ON "AIInterviewAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AIInterviewEvaluation_answerId_key" ON "AIInterviewEvaluation"("answerId");

-- CreateIndex
CREATE UNIQUE INDEX "AIInterviewResult_sessionId_key" ON "AIInterviewResult"("sessionId");

-- AddForeignKey
ALTER TABLE "AIInterviewQuestion" ADD CONSTRAINT "AIInterviewQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInterviewQuestion" ADD CONSTRAINT "AIInterviewQuestion_parentAIQuestionId_fkey" FOREIGN KEY ("parentAIQuestionId") REFERENCES "AIInterviewQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInterviewAnswer" ADD CONSTRAINT "AIInterviewAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AIInterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInterviewEvaluation" ADD CONSTRAINT "AIInterviewEvaluation_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "AIInterviewAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInterviewResult" ADD CONSTRAINT "AIInterviewResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
