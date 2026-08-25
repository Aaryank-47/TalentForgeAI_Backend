export const candidateSelect = {
    id: true,
    userId: true,
    fullName: true,
    createdAt: true,
    updatedAt: true,
};
export const candidateProfileSelect = {
    id: true,
    userId: true,
    fullName: true,
    phoneNumber: true,
    profilePicture: true,
    headline: true,
    bio: true,
    gender: true,
    experienceLevel: true,
    currentLocation: true,
    preferredLocation: true,
    currentCompany: true,
    currentDesignation: true,
    totalExperience: true,
    expectedSalary: true,
    currentSalary: true,
    noticePeriod: true,
    linkedinUrl: true,
    githubUrl: true,
    portfolioUrl: true,
    websiteUrl: true,
    isOpenToWork: true,
    profileCompletion: true,
    createdAt: true,
    updatedAt: true,
    skills: {
        select: {
            id: true,
            name: true,
            yearsOfExperience: true,
            candidateId: true
        }
    },
    resumes: {
        select: {
            id: true,
            resumeName: true,
            resumeUrl: true,
            fileSize: true,
            uploadedAt: true,
            parsingStatus: true
        }
    },
    educations: {
        select: {
            id: true,
            candidateId: true,
            collegeName: true,
            degree: true,
            fieldOfStudy: true,
            currentlyStudying: true,
            startDate: true,
            endDate: true,
            gradingSystem: true,
            gradeText: true,
            grade: true,
            createdAt: true,
            updatedAt: true
        }
    },
    experiences: {
        select: {
            id: true,
            candidateId: true,
            companyName: true,
            designation: true,
            employmentType: true,
            description: true,
            location: true,
            startDate: true,
            endDate: true,
            currentlyWorking: true,
            createdAt: true,
            updatedAt: true
        }
    }
};
export const resume = {
    id: true,
    resumeName: true,
    resumeUrl: true,
    fileSize: true,
    uploadedAt: true,
    parsingStatus: true,
    parsingError: true,
    parsingStartedAt: true,
    parsingCompletedAt: true
};
export const skill = {
    id: true,
    name: true,
    yearsOfExperience: true,
    candidateId: true
};
export const education = {
    id: true,
    candidateId: true,
    collegeName: true,
    degree: true,
    fieldOfStudy: true,
    currentlyStudying: true,
    startDate: true,
    endDate: true,
    gradingSystem: true,
    gradeText: true,
    grade: true,
    createdAt: true,
    updatedAt: true
};
export const experience = {
    id: true,
    candidateId: true,
    companyName: true,
    designation: true,
    employmentType: true,
    description: true,
    location: true,
    startDate: true,
    endDate: true,
    currentlyWorking: true,
    createdAt: true,
    updatedAt: true
};
//# sourceMappingURL=candidate.select.js.map