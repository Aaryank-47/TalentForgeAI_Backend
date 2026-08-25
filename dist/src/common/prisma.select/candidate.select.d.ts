export declare const candidateSelect: {
    readonly id: true;
    readonly userId: true;
    readonly fullName: true;
    readonly createdAt: true;
    readonly updatedAt: true;
};
export declare const candidateProfileSelect: {
    id: boolean;
    userId: boolean;
    fullName: boolean;
    phoneNumber: boolean;
    profilePicture: boolean;
    headline: boolean;
    bio: boolean;
    gender: boolean;
    experienceLevel: boolean;
    currentLocation: boolean;
    preferredLocation: boolean;
    currentCompany: boolean;
    currentDesignation: boolean;
    totalExperience: boolean;
    expectedSalary: boolean;
    currentSalary: boolean;
    noticePeriod: boolean;
    linkedinUrl: boolean;
    githubUrl: boolean;
    portfolioUrl: boolean;
    websiteUrl: boolean;
    isOpenToWork: boolean;
    profileCompletion: boolean;
    createdAt: boolean;
    updatedAt: boolean;
    skills: {
        select: {
            id: boolean;
            name: boolean;
            yearsOfExperience: boolean;
            candidateId: boolean;
        };
    };
    resumes: {
        select: {
            id: boolean;
            resumeName: boolean;
            resumeUrl: boolean;
            fileSize: boolean;
            uploadedAt: boolean;
            parsingStatus: boolean;
        };
    };
    educations: {
        select: {
            id: boolean;
            candidateId: boolean;
            collegeName: boolean;
            degree: boolean;
            fieldOfStudy: boolean;
            currentlyStudying: boolean;
            startDate: boolean;
            endDate: boolean;
            gradingSystem: boolean;
            gradeText: boolean;
            grade: boolean;
            createdAt: boolean;
            updatedAt: boolean;
        };
    };
    experiences: {
        select: {
            id: boolean;
            candidateId: boolean;
            companyName: boolean;
            designation: boolean;
            employmentType: boolean;
            description: boolean;
            location: boolean;
            startDate: boolean;
            endDate: boolean;
            currentlyWorking: boolean;
            createdAt: boolean;
            updatedAt: boolean;
        };
    };
};
export declare const resume: {
    readonly id: true;
    readonly resumeName: true;
    readonly resumeUrl: true;
    readonly fileSize: true;
    readonly uploadedAt: true;
    readonly parsingStatus: true;
    readonly parsingError: true;
    readonly parsingStartedAt: true;
    readonly parsingCompletedAt: true;
};
export declare const skill: {
    readonly id: true;
    readonly name: true;
    readonly yearsOfExperience: true;
    readonly candidateId: true;
};
export declare const education: {
    readonly id: true;
    readonly candidateId: true;
    readonly collegeName: true;
    readonly degree: true;
    readonly fieldOfStudy: true;
    readonly currentlyStudying: true;
    readonly startDate: true;
    readonly endDate: true;
    readonly gradingSystem: true;
    readonly gradeText: true;
    readonly grade: true;
    readonly createdAt: true;
    readonly updatedAt: true;
};
export declare const experience: {
    readonly id: true;
    readonly candidateId: true;
    readonly companyName: true;
    readonly designation: true;
    readonly employmentType: true;
    readonly description: true;
    readonly location: true;
    readonly startDate: true;
    readonly endDate: true;
    readonly currentlyWorking: true;
    readonly createdAt: true;
    readonly updatedAt: true;
};
//# sourceMappingURL=candidate.select.d.ts.map