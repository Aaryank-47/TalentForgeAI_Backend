import { Router } from "express"
import { CandidateController } from "../controllers/candidate.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js"
import { 
    updateCandidateProfileDto, 
    deleteResumesDto, 
    addSkillsDto,
    updateSkillDto,
    skillsIdsDto,
    addEducationDto,
    updateEducationDto,
    addExperienceDto,
    updateExperienceDto
 } from "../dto/candidate.dto.js";
import { upload } from "../../../common/uploads/index.js";

const candidateRoutes = Router();
candidateRoutes.get(
    "/me",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getCandidateProfile
);
candidateRoutes.patch(
    "/me",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(updateCandidateProfileDto, 'body'),
    CandidateController.updateCandidateProfile
);
candidateRoutes.get(
    "/me/profile-completion",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getProfileCompletion
);

candidateRoutes.post(
    "/me/resume",
    authMiddleware,
    authorize("CANDIDATE"),
    upload.single("resume"),
    CandidateController.uploadResume
)

candidateRoutes.get(
    "/me/resumes",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getResumes
)

candidateRoutes.get(
    "/resumes/:resumeId",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getResumeById
)

candidateRoutes.delete(
    "/resumes",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(deleteResumesDto, 'body'),
    CandidateController.deleteResumes
)

candidateRoutes.post(
    "/me/skills",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(addSkillsDto, 'body'),
    CandidateController.addSkills
)

candidateRoutes.get(
    "/me/skills",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getSkills
)

candidateRoutes.patch(
    "/me/skills/:skillId",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(updateSkillDto, 'body'),
    CandidateController.updateSkill
)

candidateRoutes.delete(
    "/me/skills/delete",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(skillsIdsDto, 'body'),
    CandidateController.deleteSkills
)

candidateRoutes.post(
    "/educations",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(addEducationDto, 'body'),
    CandidateController.addEducation
)

candidateRoutes.get(
    "/educations",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getEducations
)

candidateRoutes.get(
    "/educations/:educationId",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getEducationById
)

candidateRoutes.patch(
    "/educations/:educationId",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(updateEducationDto, 'body'),
    CandidateController.updateEducation
)

candidateRoutes.delete(
    "/educations/:educationId",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.deleteEducation
)

candidateRoutes.post(
    "/experiences",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(addExperienceDto, 'body'),
    CandidateController.addExperience
)

candidateRoutes.get(
    "/experiences",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getExperiences
)

candidateRoutes.get(
    "/experiences/:experienceId",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getExperienceById
)

candidateRoutes.patch(
    "/experiences/:experienceId",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(updateExperienceDto, 'body'),
    CandidateController.updateExperience
)

candidateRoutes.delete(
    "/experiences/:experienceId",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.deleteExperience
)
export default candidateRoutes;