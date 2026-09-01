import { describe, expect, it, jest, beforeEach, afterEach, afterAll } from "@jest/globals";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { CandidateController } from "../../candidate/controllers/candidate.controller.js";
import { CandidateService } from "../../candidate/services/candidate.service.js";
import cloudinary from "../../../common/uploads/cloudinary.js";
import { getResumeProcessingQueue, closeResumeProcessingQueue } from "../queues/resume-processing.queue.js";
import type { Request, Response } from "express";

describe("CandidateController.uploadResume", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    afterAll(async () => {
        await closeResumeProcessingQueue();
    });

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockReq = {
            user: { id: "user-123", role: "CANDIDATE" } as any,
            file: {
                originalname: "Jane_Doe_Resume.pdf",
                mimetype: "application/pdf",
                size: 102400,
                buffer: Buffer.from("pdf content")
            } as Express.Multer.File
        };

        mockRes = {
            status: statusMock as any,
            json: jsonMock as any
        };

        (jest.spyOn(cloudinary.uploader, "upload_stream") as any).mockImplementation((options: any, callback: any) => {
            const fakeStream: any = {
                end: (buf: Buffer) => {
                    callback(null, {
                        url: "http://res.cloudinary.com/test/resume.pdf",
                        secure_url: "https://res.cloudinary.com/test/resume.pdf",
                        public_id: "resumes/resume-123",
                        format: "pdf",
                        resource_type: "raw",
                        bytes: 102400,
                        created_at: new Date().toISOString()
                    });
                }
            };
            return fakeStream;
        });

        jest.spyOn(CandidateService, "uploadResume").mockResolvedValue({
            id: "resume-123",
            candidateId: "candidate-456",
            resumeName: "Jane_Doe_Resume.pdf",
            resumeUrl: "https://res.cloudinary.com/test/resume.pdf",
            fileSize: 102400,
            uploadedAt: new Date(),
            deletedAt: null,
            parsingStatus: "QUEUED",
            parsingStartedAt: null,
            parsingCompletedAt: null,
            parsingError: null,
            rawParsedData: null
        } as any);

        const queue = getResumeProcessingQueue();
        jest.spyOn(queue, "add").mockResolvedValue({
            id: "resume-processing-resume-123"
        } as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("returns HTTP 400 Bad Request when no file is attached", async () => {
        mockReq.file = undefined;

        await CandidateController.uploadResume(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "No resume file uploaded"
            })
        );
    });

    it("stores file, creates DB record, enqueues job and returns HTTP 202 Accepted immediately", async () => {
        await CandidateController.uploadResume(mockReq as Request, mockRes as Response);

        expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
            expect.objectContaining({ folder: "resumes", resource_type: "raw" }),
            expect.any(Function)
        );

        expect(CandidateService.uploadResume).toHaveBeenCalledWith("user-123", {
            resumeUrl: "https://res.cloudinary.com/test/resume.pdf",
            resumeName: "Jane_Doe_Resume.pdf",
            fileSize: 102400
        });

        const queue = getResumeProcessingQueue();
        expect(queue.add).toHaveBeenCalledWith(
            "process-resume",
            expect.objectContaining({
                candidateId: "candidate-456",
                resumeId: "resume-123",
                fileReference: "https://res.cloudinary.com/test/resume.pdf",
                mimeType: "application/pdf",
                originalName: "Jane_Doe_Resume.pdf"
            }),
            expect.objectContaining({
                jobId: "resume-processing-resume-123"
            })
        );

        expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.ACCEPTED);
        expect(jsonMock).toHaveBeenCalledWith({
            success: true,
            message: "Resume uploaded successfully and queued for processing",
            data: {
                resumeId: "resume-123",
                jobId: "resume-processing-resume-123",
                status: "QUEUED"
            }
        });
    });
});
