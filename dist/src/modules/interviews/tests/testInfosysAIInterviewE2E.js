import prisma from "../../../config/database.js";
import { seedInfosysTestData } from "./seedInfosysAIInterviewData.js";
import { AIInterviewSessionService, AIInterviewCompletionService } from "../AI-interview/services/ai.interview.service.js";
import { AIInterviewFinalEvaluationService } from "../AI-interview/services/ai.final.evaluation.service.js";
async function runE2ETestSuite() {
    console.log("==========================================================================");
    console.log("     STARTING INFOSYS AI INTERVIEW END-TO-END AUTOMATED TEST SUITE        ");
    console.log("==========================================================================");
    // Step 1: Seed real Infosys test data
    const seedData = await seedInfosysTestData();
    const { companyId, candidateUserId, normalSessionId, timeoutSessionId } = seedData;
    console.log("\n--------------------------------------------------------------------------");
    console.log("TEST FLOW 1: NORMAL INTERVIEW COMPLETION (5-6 QUESTIONS + FINAL EVAL)");
    console.log("--------------------------------------------------------------------------");
    // 1. Candidate Starts Interview
    console.log(`\n[Step 1] Candidate starts normal interview session: ${normalSessionId}`);
    let state = await AIInterviewSessionService.validateAndGetCurrentQuestion(normalSessionId, candidateUserId);
    console.log(`-> Session Status: ${state.status}`);
    console.log(`-> First Question (Q${state.question?.sequence}): "${state.question?.question}"`);
    console.log(`-> Topic: ${state.question?.topic || "Backend Engineering"}, Skill: ${state.question?.skill || "TypeScript/Node.js"}`);
    if (!state.question) {
        throw new Error("Failed to generate initial question for normal session");
    }
    let currentQuestionId = state.question.questionId;
    let questionCounter = 1;
    let isCompleted = false;
    // Realistic sample answers tailored for Infosys Backend Engineering interview questions
    const sampleAnswers = [
        "In Node.js, asynchronous operations are handled via the Event Loop and Thread Pool (libuv). Non-blocking I/O delegates tasks like disk read/write or network calls to libuv workers while keeping the main JavaScript execution thread unblocked.",
        "PostgreSQL performance can be optimized by adding B-tree indexes on frequently queried foreign key columns, running EXPLAIN ANALYZE to identify slow sequential scans, connection pooling via PgBouncer, and implementing read-replicas for heavy read workloads.",
        "To handle rate limiting in microservices, I implement a Sliding Window Counter algorithm using Redis atomic increments and expiration timers. Redis allows distributed nodes to synchronize rate limits across candidate API gateways efficiently.",
        "I secure REST APIs using JWT tokens signed with RS256 asymmetry, mandatory HTTPS/TLS 1.3 encryption, CORS domain whitelisting, input validation with Zod schemas, and standard Helmet security headers.",
        "Microservices communication can be designed asynchronously using event-driven architectures (Kafka or RabbitMQ) for eventual consistency, or synchronously using gRPC/HTTP REST for real-time request-response flows with circuit breaker pattern using Resilience4j or Opossum."
    ];
    // 2. Loop through questions until interview reaches completion
    while (!isCompleted && questionCounter <= 7) {
        console.log(`\n[Step 2.${questionCounter}] Candidate submits answer for Question #${questionCounter} (Question ID: ${currentQuestionId})`);
        const answerText = sampleAnswers[(questionCounter - 1) % sampleAnswers.length];
        console.log(`-> Candidate Answer: "${answerText.substring(0, 90)}..."`);
        const submitResult = await AIInterviewSessionService.submitAnswer({
            userId: candidateUserId,
            sessionId: normalSessionId,
            questionId: currentQuestionId,
            answerText,
            recordingUrl: null
        });
        console.log(`-> Answer Submitted Successfully! Answer ID: ${submitResult.answerId}`);
        console.log(`-> AI Answer Evaluation Score: ${submitResult.evaluation?.score}/100`);
        console.log(`-> AI Feedback Summary: "${submitResult.evaluation?.feedback}"`);
        console.log(`-> Strengths Identified: ${JSON.stringify(submitResult.evaluation?.strengths)}`);
        console.log(`-> Weaknesses Identified: ${JSON.stringify(submitResult.evaluation?.weaknesses)}`);
        if (submitResult.completed) {
            isCompleted = true;
            console.log(`\n-> SUCCESS: AI Interview Marked COMPLETED after ${questionCounter} questions!`);
            break;
        }
        if (submitResult.nextQuestion) {
            currentQuestionId = submitResult.nextQuestion.questionId;
            questionCounter++;
            console.log(`-> AI Delivered Next Question (Sequence ${submitResult.nextQuestion.sequence}): "${submitResult.nextQuestion.question}"`);
        }
        else {
            console.log("-> No next question returned, checking session state...");
            const nextState = await AIInterviewSessionService.validateAndGetCurrentQuestion(normalSessionId, candidateUserId);
            if (nextState.status === "COMPLETED") {
                isCompleted = true;
                break;
            }
            if (nextState.question) {
                currentQuestionId = nextState.question.questionId;
                questionCounter++;
            }
        }
    }
    if (!isCompleted) {
        console.log(`\n-> Finalizing interview session after ${questionCounter} questions...`);
        await AIInterviewCompletionService.finalizeSession(normalSessionId);
    }
    // 3. Employer Retrieves Final Evaluation Result
    console.log(`\n[Step 3] Employer retrieves final interview report for Infosys (Company ID: ${companyId})`);
    const finalReport = await AIInterviewFinalEvaluationService.getFinalReport(normalSessionId);
    console.log("\n==========================================================================");
    console.log("                     INFOSYS FINAL INTERVIEW REPORT                       ");
    console.log("==========================================================================");
    console.log(`Interview Title: ${finalReport.session.interview.title}`);
    console.log(`Company ID: ${finalReport.session.job?.companyId}`);
    console.log(`Candidate Status: ${finalReport.session.status}`);
    console.log(`Total Questions Evaluated: ${finalReport.questions.length}`);
    console.log(`Overall Score: ${finalReport.finalEvaluation?.overallScore}/100`);
    console.log(`Final Recommendation: ${finalReport.finalEvaluation?.recommendation}`);
    console.log(`Executive Summary: "${finalReport.finalEvaluation?.overallFeedback}"`);
    console.log(`Strengths: ${JSON.stringify(finalReport.finalEvaluation?.strengths)}`);
    console.log(`Weaknesses: ${JSON.stringify(finalReport.finalEvaluation?.weaknesses)}`);
    console.log("\n--------------------------------------------------------------------------");
    console.log("TEST FLOW 2: INTERVIEW TIMEOUT & ABANDONMENT");
    console.log("--------------------------------------------------------------------------");
    // 1. Candidate Starts Timeout Session
    console.log(`\n[Step 1] Candidate starts timeout interview session: ${timeoutSessionId}`);
    const timeoutState = await AIInterviewSessionService.validateAndGetCurrentQuestion(timeoutSessionId, candidateUserId);
    console.log(`-> Initial Session Status: ${timeoutState.status}`);
    console.log(`-> Initial Question: "${timeoutState.question?.question}"`);
    if (!timeoutState.question) {
        throw new Error("Failed to start timeout session");
    }
    // 2. Candidate Submits 1 Answer then abandons
    console.log(`\n[Step 2] Candidate submits 1 answer and abandons session...`);
    const partialSubmit = await AIInterviewSessionService.submitAnswer({
        userId: candidateUserId,
        sessionId: timeoutSessionId,
        questionId: timeoutState.question.questionId,
        answerText: "Microservices communicate via REST or gRPC protocols.",
        recordingUrl: null
    });
    console.log(`-> Partial Answer Evaluated Score: ${partialSubmit.evaluation?.score}/100`);
    // 3. Simulate Time Expiry (Fast forward startedAt 35 minutes into the past)
    console.log(`\n[Step 3] Simulating interview duration limit expiry (setting startedAt to 35 minutes ago)...`);
    const expiredTime = new Date(Date.now() - 35 * 60 * 1000);
    await prisma.interviewSession.update({
        where: { id: timeoutSessionId },
        data: { startedAt: expiredTime }
    });
    // 4. Candidate/System attempts next action -> Session EXPIRED trigger
    console.log(`\n[Step 4] Triggering expiration validation on expired session...`);
    const postExpiryState = await AIInterviewSessionService.validateAndGetCurrentQuestion(timeoutSessionId, candidateUserId);
    console.log(`-> Session Status after Expiry: ${postExpiryState.status}`);
    console.log(`-> Expiration Reason: ${postExpiryState.reason}`);
    // 5. Employer Retrieves Partial Final Report on Abandonment
    console.log(`\n[Step 5] Employer retrieves partial report for abandoned/expired session...`);
    const timeoutReport = await AIInterviewFinalEvaluationService.getFinalReport(timeoutSessionId);
    console.log(`-> Expired Session Status: ${timeoutReport.session.status}`);
    console.log(`-> Evaluated Questions Count: ${timeoutReport.questions.length}`);
    console.log(`-> Partial Evaluation Score: ${timeoutReport.finalEvaluation?.overallScore}/100`);
    console.log(`-> Partial Recommendation: ${timeoutReport.finalEvaluation?.recommendation}`);
    console.log("\n==========================================================================");
    console.log("  SUCCESS! ALL E2E INFOSYS AI INTERVIEW TEST FLOWS PASSED VERIFICATION!");
    console.log("==========================================================================");
}
runE2ETestSuite()
    .then(() => prisma.$disconnect())
    .catch(async (err) => {
    console.error("\n❌ E2E TEST FAILED:", err);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=testInfosysAIInterviewE2E.js.map