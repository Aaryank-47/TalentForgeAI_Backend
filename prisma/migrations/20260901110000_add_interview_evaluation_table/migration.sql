-- CreateTable
CREATE TABLE "InterviewEvaluation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "companyMemberId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "communicationScore" DOUBLE PRECISION,
    "technicalScore" DOUBLE PRECISION,
    "problemSolvingScore" DOUBLE PRECISION,
    "behaviourScore" DOUBLE PRECISION,
    "cultureFitScore" DOUBLE PRECISION,
    "strengths" JSONB,
    "improvements" JSONB,
    "comments" TEXT,
    "recommendation" "AIRecommendation",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewEvaluation_sessionId_companyMemberId_key" ON "InterviewEvaluation"("sessionId", "companyMemberId");

-- CreateIndex
CREATE INDEX "InterviewEvaluation_sessionId_idx" ON "InterviewEvaluation"("sessionId");

-- CreateIndex
CREATE INDEX "InterviewEvaluation_companyMemberId_idx" ON "InterviewEvaluation"("companyMemberId");

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_companyMemberId_fkey" FOREIGN KEY ("companyMemberId") REFERENCES "CompanyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
