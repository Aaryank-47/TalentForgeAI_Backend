import { MESSAGE } from "../../../common/constants/messages.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { CandidateService } from "../services/candidate.service .js";
import { uploadFileToCloudinary } from "../../../common/uploads/index.js";
export class CandidateController {
    static async getCandidateProfile(req, res) {
        const candidateId = req.user.id;
        const candidate = await CandidateService.getCandidateProfile(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Candidate profile fetched successfully",
            data: candidate
        });
    }
    static async updateCandidateProfile(req, res) {
        const candidateId = req.user.id;
        const updateData = req.body;
        const candidate = await CandidateService.updateProfile(candidateId, updateData);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.USER_PROFILE_UPDATED,
            data: candidate
        });
    }
    static async getProfileCompletion(req, res) {
        const candidateId = req.user.id;
        const completion = await CandidateService.calculateProfileCompletion(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Profile completion calculated successfully",
            data: { completion }
        });
    }
    static async uploadResume(req, res) {
        const candidateId = req.user.id;
        const file = req.file;
        if (!file) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "No resume file uploaded"
            });
            return;
        }
        const uploadResult = await uploadFileToCloudinary(file, {
            folder: "resumes",
            resourceType: "raw"
        });
        const candidate = await CandidateService.uploadResume(candidateId, {
            resumeUrl: uploadResult.secureUrl,
            resumeName: file.originalname,
            fileSize: file.size
        });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Resume uploaded successfully",
            data: candidate
        });
    }
    static async getResumes(req, res) {
        const candidateId = req.user.id;
        const resumes = await CandidateService.getResumes(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Resumes fetched successfully",
            data: resumes
        });
    }
    static async getResumeById(req, res) {
        const candidateId = req.user.id;
        const { resumeId } = req.params;
        const resume = await CandidateService.getResumeById(resumeId, candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Resume details fetched successfully",
            data: resume
        });
    }
    static async deleteResumes(req, res) {
        const candidateId = req.user.id;
        const { resumeIds } = req.body;
        await CandidateService.deleteResumes(resumeIds, candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Resumes deleted successfully"
        });
    }
    static async addSkills(req, res) {
        const candidateId = req.user.id;
        const { skills } = req.body;
        const skill = await CandidateService.addSkills(candidateId, skills);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Skill added successfully",
            data: skill
        });
    }
    static async getSkills(req, res) {
        const candidateId = req.user.id;
        const skills = await CandidateService.getAllSkills(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Skills fetched successfully",
            data: skills
        });
    }
    static async updateSkill(req, res) {
        const candidateId = req.user.id;
        const { skillId } = req.params;
        const { skillName, skillExperience } = req.body;
        console.log("Requested From Body : " + JSON.stringify(req.body));
        const updatedSkills = await CandidateService.updateSkills(candidateId, skillId, skillName, skillExperience);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Skills updated successfully",
            data: updatedSkills
        });
    }
    static async deleteSkills(req, res) {
        const candidateId = req.user.id;
        const { skillIds } = req.body;
        await CandidateService.deleteSkills(candidateId, skillIds);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Skills deleted successfully"
        });
    }
    static async addEducation(req, res) {
        const candidateId = req.user.id;
        const educationData = req.body;
        const newEducation = await CandidateService.addEducation(candidateId, educationData);
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Education added successfully",
            data: newEducation
        });
    }
    static async getEducations(req, res) {
        const candidateId = req.user.id;
        const educations = await CandidateService.getEducations(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Educations fetched successfully",
            data: educations
        });
    }
    static async getEducationById(req, res) {
        const candidateId = req.user.id;
        const { educationId } = req.params;
        const education = await CandidateService.getEducationById(educationId, candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Education details fetched successfully",
            data: education
        });
    }
    static async updateEducation(req, res) {
        const candidateId = req.user.id;
        const { educationId } = req.params;
        const updateData = req.body;
        const updatedEducation = await CandidateService.updateEducation(candidateId, educationId, updateData);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Education updated successfully",
            data: updatedEducation
        });
    }
    static async deleteEducation(req, res) {
        const candidateId = req.user.id;
        const { educationId } = req.params;
        const deletedEducation = await CandidateService.deleteEducation(candidateId, educationId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Education deleted successfully",
            data: deletedEducation
        });
    }
    static async addExperience(req, res) {
        const candidateId = req.user.id;
        const experienceData = req.body;
        const newExperience = await CandidateService.addExperience(candidateId, experienceData);
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Experience added successfully",
            data: newExperience
        });
    }
    static async getExperiences(req, res) {
        const candidateId = req.user.id;
        const experiences = await CandidateService.getExperiences(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Experiences fetched successfully",
            data: experiences
        });
    }
    static async getExperienceById(req, res) {
        const candidateId = req.user.id;
        const { experienceId } = req.params;
        const experience = await CandidateService.getExperienceById(experienceId, candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Experience details fetched successfully",
            data: experience
        });
    }
    static async updateExperience(req, res) {
        const candidateId = req.user.id;
        const { experienceId } = req.params;
        const updateData = req.body;
        const updatedExperience = await CandidateService.updateExperience(candidateId, experienceId, updateData);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Experience updated successfully",
            data: updatedExperience
        });
    }
    static async deleteExperience(req, res) {
        const candidateId = req.user.id;
        const { experienceId } = req.params;
        const deletedExperience = await CandidateService.deleteExperience(candidateId, experienceId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Experience deleted successfully",
            data: deletedExperience
        });
    }
    static async getPublicProfile(req, res) {
        const { candidateId } = req.params;
        const profile = await CandidateService.getPublicProfile(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Public profile fetched successfully",
            data: profile
        });
    }
    static async getCandidateResumes(req, res) {
        const { candidateId } = req.params;
        const loggedInUser = {
            id: req.user.id,
            role: req.user.role
        };
        const resumes = await CandidateService.getCandidateResumes(candidateId, loggedInUser);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Candidate resumes fetched successfully",
            data: resumes
        });
    }
    static async toggleOpenToWork(req, res) {
        const userId = req.user.id;
        const { isOpenToWork } = req.body;
        const updatedProfile = await CandidateService.toggleOpenToWork(userId, isOpenToWork);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Availability toggled successfully",
            data: updatedProfile
        });
    }
    static async updateSalaryPreferences(req, res) {
        const userId = req.user.id;
        const updateData = req.body;
        const updatedProfile = await CandidateService.updateSalaryPreferences(userId, updateData);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Salary preferences updated successfully",
            data: updatedProfile
        });
    }
    static async updateLocationPreferences(req, res) {
        const userId = req.user.id;
        const updateData = req.body;
        const updatedProfile = await CandidateService.updateLocationPreferences(userId, updateData);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Location preferences updated successfully",
            data: updatedProfile
        });
    }
}
//# sourceMappingURL=candidate.controller.js.map