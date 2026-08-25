import { Router } from "express";
import { CandidateController } from "../../candidate/controllers/candidate.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { ensureCandidateProfile } from "../../../common/middleware/ensureCandidateProfile.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { upload } from "../../../common/uploads/index.js";
import { CandidateDto } from "../../candidate/dto/candidate.dto.js";
const router = Router();
// POST /resume/upload - Upload resume and enqueue BullMQ processing
router.post("/upload", authMiddleware, ensureCandidateProfile, upload.single("resume"), CandidateController.uploadResume);
// GET /resume/my - Get all resumes of current candidate
router.get("/my", authMiddleware, ensureCandidateProfile, CandidateController.getResumes);
// GET /resume/:resumeId - Get single resume details and parsing status
router.get("/:resumeId", authMiddleware, ensureCandidateProfile, CandidateController.getResumeById);
// POST /resume/:resumeId/retry - Retry processing a failed/stuck resume
router.post("/:resumeId/retry", authMiddleware, ensureCandidateProfile, CandidateController.retryResumeProcessing);
// DELETE /resume/:resumeId - Delete single resume by ID parameter
router.delete("/:resumeId", authMiddleware, ensureCandidateProfile, async (req, res, next) => {
    try {
        const candidateId = req.user.id;
        const { resumeId } = req.params;
        req.body = { resumeIds: [resumeId] };
        await CandidateController.deleteResumes(req, res);
    }
    catch (err) {
        next(err);
    }
});
// DELETE /resume - Delete multiple resumes (supports body: { resumeIds: [...] })
router.delete("/", authMiddleware, ensureCandidateProfile, validate(CandidateDto.deleteResumes, "body"), CandidateController.deleteResumes);
export default router;
//# sourceMappingURL=resume.routes.js.map