export const Jobselect = {
    select: {
        id: true,
        title: true,
        description: true,
        employmentType: true,
        workplaceType: true,
        location: true,
        minExperience: true,
        maxExperience: true,
        minimumSalary: true,
        maximumSalary: true,
        salaryPeriod: true,
        hideSalary: true,
        applicationDeadline: true,
        skills: true,
        benefits: true,
        isPublished: true,
    }
} as const