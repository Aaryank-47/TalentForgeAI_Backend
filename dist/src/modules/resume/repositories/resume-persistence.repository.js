import prisma from "../../../config/database.js";
const parseDate = (value) => {
    if (!value)
        return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};
const fingerprint = (...parts) => parts.map((part) => (part ?? "").trim().toLocaleLowerCase()).join("|");
export class ResumePersistenceRepository {
    async persist(candidateId, data) {
        return prisma.$transaction(async (tx) => this.persistInTransaction(tx, candidateId, data));
    }
    async persistInTransaction(tx, candidateId, data) {
        const candidate = await tx.candidate.findUniqueOrThrow({
            where: { id: candidateId },
            select: { id: true, userId: true }
        });
        const candidateUpdate = {};
        const { personal, professional } = data;
        if (personal.fullName != null)
            candidateUpdate.fullName = personal.fullName;
        if (personal.phoneNumber != null)
            candidateUpdate.phoneNumber = personal.phoneNumber;
        if (personal.currentLocation != null)
            candidateUpdate.currentLocation = personal.currentLocation;
        if (personal.linkedinUrl != null)
            candidateUpdate.linkedinUrl = personal.linkedinUrl;
        if (personal.githubUrl != null)
            candidateUpdate.githubUrl = personal.githubUrl;
        if (personal.portfolioUrl != null)
            candidateUpdate.portfolioUrl = personal.portfolioUrl;
        if (personal.websiteUrl != null)
            candidateUpdate.websiteUrl = personal.websiteUrl;
        if (professional.headline != null)
            candidateUpdate.headline = professional.headline;
        if (professional.bio != null)
            candidateUpdate.bio = professional.bio;
        if (professional.currentCompany != null)
            candidateUpdate.currentCompany = professional.currentCompany;
        if (professional.currentDesignation != null)
            candidateUpdate.currentDesignation = professional.currentDesignation;
        if (professional.totalExperience != null)
            candidateUpdate.totalExperience = professional.totalExperience;
        await tx.candidate.update({ where: { id: candidateId }, data: candidateUpdate });
        if (personal.email != null) {
            await tx.user.update({ where: { id: candidate.userId }, data: { email: personal.email } });
        }
        const skills = await this.persistSkills(tx, candidateId, data.skills);
        const experiences = await this.persistExperiences(tx, candidateId, data.experience);
        const education = await this.persistEducation(tx, candidateId, data.education);
        const projects = await this.persistProjects(tx, candidateId, data.projects);
        const certifications = await this.persistCertifications(tx, candidateId, data.certifications);
        return { candidateId, ...skills, ...experiences, ...education, ...projects, ...certifications };
    }
    async persistSkills(tx, candidateId, skills) {
        const existing = await tx.candidateSkill.findMany({ where: { candidateId } });
        const existingByKey = new Map(existing.map((skill) => [skill.name.trim().toLocaleLowerCase(), skill]));
        const incoming = new Map();
        for (const skill of skills) {
            const key = skill.name.trim().toLocaleLowerCase();
            const current = incoming.get(key);
            const years = skill.yearsOfExperience ?? null;
            incoming.set(key, {
                name: skill.name,
                yearsOfExperience: current?.yearsOfExperience == null
                    ? years
                    : years == null
                        ? current.yearsOfExperience
                        : Math.max(current.yearsOfExperience, years)
            });
        }
        const canonicalSkills = await tx.skill.findMany({
            where: { name: { in: [...incoming.values()].map((skill) => skill.name) }, isActive: true },
            select: { id: true, name: true }
        });
        const canonicalByKey = new Map(canonicalSkills.map((skill) => [skill.name.trim().toLocaleLowerCase(), skill]));
        const newSkills = [...incoming.entries()]
            .filter(([key]) => !existingByKey.has(key))
            .map(([, skill]) => ({ candidateId, ...skill, skillId: canonicalByKey.get(skill.name.trim().toLocaleLowerCase())?.id ?? null }));
        const changedSkills = [];
        for (const [key, skill] of incoming) {
            const current = existingByKey.get(key);
            const skillId = canonicalByKey.get(skill.name.trim().toLocaleLowerCase())?.id ?? null;
            if (!current || (current.name === skill.name && current.yearsOfExperience === skill.yearsOfExperience && current.skillId === skillId))
                continue;
            changedSkills.push({ id: current.id, candidateId, ...skill, skillId });
        }
        if (changedSkills.length > 0) {
            await tx.candidateSkill.deleteMany({ where: { id: { in: changedSkills.map((skill) => skill.id) } } });
        }
        if (newSkills.length + changedSkills.length > 0) {
            await tx.candidateSkill.createMany({ data: [...newSkills, ...changedSkills] });
        }
        return { skillsCreated: newSkills.length, skillsUpdated: changedSkills.length };
    }
    async persistExperiences(tx, candidateId, experiences) {
        const existing = await tx.candidateExperience.findMany({ where: { candidateId } });
        const existingByKey = new Map(existing.map((experience) => [
            fingerprint(experience.companyName, experience.designation, experience.startDate.toISOString()), experience
        ]));
        const incoming = new Map();
        for (const experience of experiences) {
            const startDate = parseDate(experience.startDate);
            const endDate = parseDate(experience.endDate);
            if (!startDate || !experience.employmentType || (!experience.currentlyWorking && !endDate))
                continue;
            incoming.set(fingerprint(experience.companyName, experience.designation, startDate.toISOString()), {
                companyName: experience.companyName,
                designation: experience.designation,
                employmentType: experience.employmentType,
                description: experience.description ?? null,
                location: experience.location ?? null,
                startDate,
                endDate: experience.currentlyWorking ? null : endDate,
                currentlyWorking: experience.currentlyWorking
            });
        }
        const newExperiences = [...incoming.entries()]
            .filter(([key]) => !existingByKey.has(key))
            .map(([, experience]) => ({ candidateId, ...experience }));
        const changedExperiences = [];
        for (const [key, experience] of incoming) {
            const current = existingByKey.get(key);
            if (!current)
                continue;
            const unchanged = current.companyName === experience.companyName && current.designation === experience.designation && current.employmentType === experience.employmentType && current.description === experience.description && current.location === experience.location && current.startDate.getTime() === experience.startDate.getTime() && (current.endDate?.getTime() ?? null) === (experience.endDate?.getTime() ?? null) && current.currentlyWorking === experience.currentlyWorking;
            if (!unchanged)
                changedExperiences.push({ id: current.id, candidateId, ...experience });
        }
        if (changedExperiences.length > 0) {
            await tx.candidateExperience.deleteMany({ where: { id: { in: changedExperiences.map((experience) => experience.id) } } });
        }
        if (newExperiences.length + changedExperiences.length > 0) {
            await tx.candidateExperience.createMany({ data: [...newExperiences, ...changedExperiences] });
        }
        return { experiencesCreated: newExperiences.length, experiencesUpdated: changedExperiences.length };
    }
    async persistEducation(tx, candidateId, education) {
        const existing = await tx.candidateEducation.findMany({ where: { candidateId } });
        const existingByKey = new Map(existing.map((item) => [
            fingerprint(item.collegeName, item.degree, item.fieldOfStudy, item.startDate.toISOString()), item
        ]));
        const incoming = new Map();
        for (const item of education) {
            const startDate = parseDate(item.startDate);
            const endDate = parseDate(item.endDate);
            if (!startDate || !item.gradingSystem || (!item.currentlyStudying && !endDate))
                continue;
            incoming.set(fingerprint(item.collegeName, item.degree, item.fieldOfStudy, startDate.toISOString()), {
                collegeName: item.collegeName,
                degree: item.degree,
                fieldOfStudy: item.fieldOfStudy,
                currentlyStudying: item.currentlyStudying,
                startDate,
                endDate: item.currentlyStudying ? null : endDate,
                gradingSystem: item.gradingSystem,
                gradeText: item.gradeText ?? null,
                grade: item.grade ?? null
            });
        }
        const newEducation = [...incoming.entries()]
            .filter(([key]) => !existingByKey.has(key))
            .map(([, item]) => ({ candidateId, ...item }));
        const changedEducation = [];
        for (const [key, item] of incoming) {
            const current = existingByKey.get(key);
            if (!current)
                continue;
            const unchanged = current.collegeName === item.collegeName && current.degree === item.degree && current.fieldOfStudy === item.fieldOfStudy && current.currentlyStudying === item.currentlyStudying && current.startDate.getTime() === item.startDate.getTime() && (current.endDate?.getTime() ?? null) === (item.endDate?.getTime() ?? null) && current.gradingSystem === item.gradingSystem && current.gradeText === item.gradeText && current.grade === item.grade;
            if (!unchanged)
                changedEducation.push({ id: current.id, candidateId, ...item });
        }
        if (changedEducation.length > 0) {
            await tx.candidateEducation.deleteMany({ where: { id: { in: changedEducation.map((item) => item.id) } } });
        }
        if (newEducation.length + changedEducation.length > 0) {
            await tx.candidateEducation.createMany({ data: [...newEducation, ...changedEducation] });
        }
        return { educationCreated: newEducation.length, educationUpdated: changedEducation.length };
    }
    async persistProjects(tx, candidateId, projects) {
        const existing = await tx.candidateProject.findMany({ where: { candidateId } });
        const existingByKey = new Map(existing.map((project) => [project.fingerprint, project]));
        const incoming = new Map();
        for (const project of projects)
            incoming.set(fingerprint(project.name, project.description), project);
        const newProjects = [...incoming.entries()]
            .filter(([key]) => !existingByKey.has(key))
            .map(([fingerprint, project]) => ({ candidateId, fingerprint, ...project }));
        const changedProjects = [];
        for (const [key, project] of incoming) {
            const current = existingByKey.get(key);
            if (!current || (current.name === project.name && current.description === project.description))
                continue;
            changedProjects.push({ id: current.id, candidateId, fingerprint: key, ...project });
        }
        if (changedProjects.length > 0) {
            await tx.candidateProject.deleteMany({ where: { id: { in: changedProjects.map((project) => project.id) } } });
        }
        if (newProjects.length + changedProjects.length > 0) {
            await tx.candidateProject.createMany({ data: [...newProjects, ...changedProjects] });
        }
        return { projectsCreated: newProjects.length, projectsUpdated: changedProjects.length };
    }
    async persistCertifications(tx, candidateId, certifications) {
        const existing = await tx.candidateCertification.findMany({ where: { candidateId } });
        const existingByKey = new Map(existing.map((certification) => [certification.fingerprint, certification]));
        const incoming = new Map();
        for (const certification of certifications)
            incoming.set(fingerprint(certification.name), certification);
        const newCertifications = [...incoming.entries()]
            .filter(([key]) => !existingByKey.has(key))
            .map(([fingerprint, certification]) => ({ candidateId, fingerprint, ...certification }));
        const changedCertifications = [];
        for (const [key, certification] of incoming) {
            const current = existingByKey.get(key);
            if (!current || current.name === certification.name)
                continue;
            changedCertifications.push({ id: current.id, candidateId, fingerprint: key, ...certification });
        }
        if (changedCertifications.length > 0) {
            await tx.candidateCertification.deleteMany({ where: { id: { in: changedCertifications.map((certification) => certification.id) } } });
        }
        if (newCertifications.length + changedCertifications.length > 0) {
            await tx.candidateCertification.createMany({ data: [...newCertifications, ...changedCertifications] });
        }
        return { certificationsCreated: newCertifications.length, certificationsUpdated: changedCertifications.length };
    }
}
//# sourceMappingURL=resume-persistence.repository.js.map