import { Prisma } from "@prisma/client";
import { removeUndefined } from "../../../common/helper/object.helper.js";
export function toCandidateUpdateInput(dto) {
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
        resumeFileId: dto.resumeUrl,
        linkedinUrl: dto.linkedinUrl,
        githubUrl: dto.githubUrl,
        portfolioUrl: dto.portfolioUrl,
        websiteUrl: dto.websiteUrl,
        isOpenToWork: dto.isOpenToWork,
    });
}
//# sourceMappingURL=candidate.mapper.js.map