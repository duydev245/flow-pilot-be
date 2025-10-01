import { ConsultationStatus } from "src/shared/constants/consultation-request.constant";
import z from "zod";

// Base schema cho ConsultationRequest
export const ConsultationRequestSchema = z.object({
    id: z.number().int(),
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email({ message: "Invalid email address" }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
    company_name: z.string().optional(),
    package_id: z.uuid({ message: "Invalid package ID" }),
    note: z.string().optional(),
    status: z.enum([ConsultationStatus.new, ConsultationStatus.contacted, ConsultationStatus.closed]).default(ConsultationStatus.new),
    created_at: z.date().default(new Date()),
    updated_at: z.date().default(new Date()).optional(),
});

// Schema cho tạo mới consultation request
export const CreateConsultationRequestSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email({ message: "Invalid email address" }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
    company_name: z.string().optional(),
    package_id: z.uuid({ message: "Invalid package ID" }),
    note: z.string().optional(),
});

// Schema cho cập nhật consultation request
export const UpdateConsultationRequestSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }).optional(),
    email: z.email({ message: "Invalid email address" }).optional(),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }).optional(),
    company_name: z.string().optional(),
    package_id: z.uuid({ message: "Invalid package ID" }).optional(),
    note: z.string().optional(),
    status: z.enum([ConsultationStatus.new, ConsultationStatus.contacted, ConsultationStatus.closed]).optional(),
});

// Types
export type ConsultationRequestType = z.infer<typeof ConsultationRequestSchema>;
export type CreateConsultationRequest = z.infer<typeof CreateConsultationRequestSchema>;
export type UpdateConsultationRequest = z.infer<typeof UpdateConsultationRequestSchema>;
