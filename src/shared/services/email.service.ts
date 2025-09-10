import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import envConfig from "../config";
import fs from "fs";
import path from "path";

// Load the HTML template once when the module is initialized

const template = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), 'utf-8');

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(envConfig.RESEND_API_KEY);
    }

    async sendOTP(payload: { email: string, code: string }) {
        const subject = '[FLOW-PILOT] OTP CODE FOR VERIFICATION';
        // Replace placeholders in the template with actual values
        const htmlContent = template.replaceAll('{{subject}}', subject).replace('{{code}}', payload.code);

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@resend.dev>',
            to: [payload.email],
            subject: subject,
            html: htmlContent,
        });
    }
}