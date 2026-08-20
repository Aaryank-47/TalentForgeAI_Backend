import { z } from "zod";
import {
  resumeParsingSchema,
  personalInfoSchema,
  professionalInfoSchema,
  resumeSkillSchema,
  resumeExperienceSchema,
  resumeEducationSchema,
  resumeProjectSchema,
  resumeCertificationSchema
} from "../dto/resume-parser.dto.js";

export type PersonalInfoResult = z.infer<typeof personalInfoSchema>;
export type ProfessionalInfoResult = z.infer<typeof professionalInfoSchema>;
export type ResumeSkillResult = z.infer<typeof resumeSkillSchema>;
export type ResumeExperienceResult = z.infer<typeof resumeExperienceSchema>;
export type ResumeEducationResult = z.infer<typeof resumeEducationSchema>;
export type ResumeProjectResult = z.infer<typeof resumeProjectSchema>;
export type ResumeCertificationResult = z.infer<typeof resumeCertificationSchema>;

export type ResumeParsingResult = z.infer<typeof resumeParsingSchema>;
