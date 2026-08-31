import { Router } from "express";
import { MatchingController } from "../controllers/matching.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { ensureCandidateProfile } from "../../../common/middleware/ensureCandidateProfile.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
const matchingRoutes = Router();
// ── Candidate Endpoints ─────────────────────────────────────────────────────
matchingRoutes.get("/candidate/matched-jobs", authMiddleware, ensureCandidateProfile, MatchingController.getMatchedJobs);
matchingRoutes.post("/candidate/recalculate-matches", authMiddleware, ensureCandidateProfile, MatchingController.recalculateCandidateMatches);
// ── Recruiter / Employer Endpoints ──────────────────────────────────────────
matchingRoutes.get("/recruiter/jobs/:jobId/matched-candidates", authMiddleware, authorize("EMPLOYER", "ADMIN", "SUPER_ADMIN"), MatchingController.getMatchedCandidates);
matchingRoutes.post("/recruiter/jobs/:jobId/recalculate-matches", authMiddleware, authorize("EMPLOYER", "ADMIN", "SUPER_ADMIN"), MatchingController.recalculateJobMatches);
export default matchingRoutes;
//# sourceMappingURL=matching.routes.js.map