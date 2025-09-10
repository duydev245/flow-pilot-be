import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import envConfig from "../config";

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(envConfig.RESEND_API_KEY);
    }

    async sendOTP(payload: { email: string, code: string }) {
        return await this.resend.emails.send({
            from: 'Flow Pilot <onboarding@resend.dev>',
            to: ['hoangduy.study@gmail.com', payload.email],
            subject: 'OTP CODE',
            html: `<strong>Your OTP CODE is ${payload.code}</strong>`,
        });
    }
}