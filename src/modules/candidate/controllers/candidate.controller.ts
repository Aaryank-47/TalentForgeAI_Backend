import { MESSAGE } from "../../../common/constants/messages.js"
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js"
import { CandidateService } from "../services/candidate.service .js";
import type { Request, Response } from "express";
import { uploadFileToCloudinary } from "../../../common/uploads/index.js";

export class CandidateController {
    static async getCandidateProfile(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const candidate = await CandidateService.getCandidateProfile(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Candidate profile fetched successfully",
            data: candidate
        });
    }

    static async updateCandidateProfile(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const updateData = req.body;
        const candidate = await CandidateService.updateProfile(candidateId, updateData);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.USER_PROFILE_UPDATED,
            data: candidate
        });
    }

    static async getProfileCompletion(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const completion = await CandidateService.calculateProfileCompletion(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Profile completion calculated successfully",
            data: { completion }
        });
    }

    static async uploadResume(
        req: Request,
        res: Response
    ): Promise<void> {
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

    static async getResumes(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const resumes = await CandidateService.getResumes(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Resumes fetched successfully",
            data: resumes
        });
    }

    static async getResumeById(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const { resumeId } = req.params;
        const resume = await CandidateService.getResumeById(resumeId as string, candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Resume details fetched successfully",
            data: resume
        });
    }

    static async deleteResumes(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const { resumeIds } = req.body;
        await CandidateService.deleteResumes(resumeIds, candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Resumes deleted successfully"
        });
    }

    static async addSkills(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const { skills } = req.body;
        const skill = await CandidateService.addSkills(candidateId, skills);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Skill added successfully",
            data: skill
        });
    }

    static async getSkills(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const skills = await CandidateService.getAllSkills(candidateId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Skills fetched successfully",
            data: skills
        });
    }

    static async updateSkill(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const { skillId } = req.params as {skillId: string};
        const { skillName, skillExperience } = req.body;
        console.log("Requested From Body : "+ JSON.stringify(req.body));
        const updatedSkills = await CandidateService.updateSkills(
            candidateId, 
            skillId, 
            skillName, 
            skillExperience
        );
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Skills updated successfully",
            data: updatedSkills
        });
    }
}

