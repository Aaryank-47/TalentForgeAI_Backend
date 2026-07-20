import { Prisma } from "@prisma/client";
import type { JobCreationDto, JobUpdateDto } from "../dto/jobs.dto.js";
export declare function toJobCreateInput(companyId: string, data: JobCreationDto, slug: string, createdById: string): Prisma.JobCreateInput;
export declare function toJobUpdateInput(jobPayload: JobUpdateDto): Prisma.JobUpdateInput;
//# sourceMappingURL=job.mapper.d.ts.map