import { Prisma } from "@prisma/client";
import type { UpdateCandidateProfileDto } from "../dto/candidate.dto.js";
import { removeUndefined } from "../../../common/helper/object.helper.js";


export function toCandidateUpdateInput(
    dto: UpdateCandidateProfileDto
): Prisma.CandidateUpdateInput {

    return removeUndefined({
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        profilePicture: dto.profilePicture,
        headline: dto.headline,
        bio: dto.bio,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
        experienceLevel: dto.experienceLevel,
        currentLocation: dto.currentLocation,
        preferredLocation: dto.preferredLocation,
        currentCompany: dto.currentCompany,
        currentDesignation: dto.currentDesignation,
        totalExperience: dto.totalExperience,
        expectedSalary: dto.expectedSalary,
        currentSalary: dto.currentSalary,
        noticePeriod: dto.noticePeriod,
        linkedinUrl: dto.linkedinUrl,
        githubUrl: dto.githubUrl,
        portfolioUrl: dto.portfolioUrl,
        websiteUrl: dto.websiteUrl,
        isOpenToWork: dto.isOpenToWork,
    }) as Prisma.CandidateUpdateInput;
}