import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import envConfig from "../config";
import fs from "fs";
import path from "path";
import { parse } from "date-fns";

// Load the HTML template once when the module is initialized
const template = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), 'utf-8');
const newAccountTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/new_account_email.html'), 'utf-8');
const customerConsultationTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/customer_consultation_request.html'), 'utf-8');
const salesConsultationTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/sales_consultation_request.html'), 'utf-8');
const paymentRequestTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/payment_request_email.html'), 'utf-8');
const paymentSuccessTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/payment_success_email.html'), 'utf-8');
const paymentFailureTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/payment_failure_email.html'), 'utf-8');

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(envConfig.RESEND_API_KEY);
    }

    async sendOTP(payload: { email: string, code: string }) {
        const subject = '[FLOW-PILOT] OTP CODE FOR VERIFICATION';
        // Replace placeholders in the template with actual values
        const htmlContent = template.replaceAll('{{subject}}', subject).replaceAll('{{code}}', payload.code);

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@flowpilot.io.vn>',
            to: [payload.email],
            subject: subject,
            html: htmlContent,
        });
    }

    async sendNewAccountEmail(payload: { email: string, name: string, password: string }) {
        const subject = '[FLOW-PILOT] YOUR NEW ACCOUNT DETAILS';
        // Replace placeholders in the template with actual values
        const htmlContent = newAccountTemplate
            .replaceAll('{{subject}}', subject)
            .replaceAll('{{name}}', payload.name)
            .replaceAll('{{email}}', payload.email)
            .replaceAll('{{password}}', payload.password);

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@flowpilot.io.vn>',
            to: [payload.email],
            subject: subject,
            html: htmlContent,
        });
    }

    async sendCustomerConsultationRequestEmail(payload: { email: string, name: string, phone: string }) {
        const subject = '[FLOW-PILOT] WE HAVE RECEIVED YOUR CONSULTATION REQUEST';
        // Replace placeholders in the template with actual values
        const htmlContent = customerConsultationTemplate
            .replaceAll('{{subject}}', subject)
            .replaceAll('{{name}}', payload.name)
            .replaceAll('{{email}}', payload.email)
            .replaceAll('{{phone}}', payload.phone);

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@flowpilot.io.vn>',
            to: [payload.email],
            subject: subject,
            html: htmlContent,
        });
    }

    async sendSalesConsultationRequestEmail(payload: { email: string, name: string, phone: string, company: string, package_name: string, note: string }) {
        const subject = `[FLOW-PILOT] NEW CONSULTATION REQUEST - ${payload.name}/${payload.phone}`;

        // Replace placeholders in the template with actual values
        const htmlContent = salesConsultationTemplate
            .replaceAll('{{subject}}', subject)
            .replaceAll('{{name}}', payload.name)
            .replaceAll('{{email}}', payload.email)
            .replaceAll('{{phone}}', payload.phone)
            .replaceAll('{{company}}', payload.company)
            .replaceAll('{{package_name}}', payload.package_name)
            .replaceAll('{{note}}', payload.note);

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@flowpilot.io.vn>',
            to: ['flowpilot.hrm@gmail.com'],
            subject: subject,
            html: htmlContent,
        });
    }

    async sendPaymentRequestEmail(payload: { email: string, package_name: string, order_id: string, payment_id: string, amount: string }) {
        const subject = `[FLOW-PILOT] PAYMENT REQUEST FOR ORDER #${payload.order_id}`;
        const description = `DHFLP${payload.payment_id}`;
        const qr_code_url = `https://qr.sepay.vn/img?acc=0987693153&bank=MBBank&amount=${payload.amount}&des=${description}`;

        // Replace placeholders in the template with actual values
        const htmlContent = paymentRequestTemplate
            .replaceAll('{{subject}}', subject)
            .replaceAll('{{order_id}}', payload.order_id)
            .replaceAll('{{package_name}}', payload.package_name)
            .replaceAll('{{account_no}}', '0987693153')
            .replaceAll('{{account_owner}}', 'BUI TUAN HAI')
            .replaceAll('{{description}}', description)
            .replaceAll('{{amount}}', payload.amount)
            .replaceAll('{{qr_code_url}}', qr_code_url);

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@flowpilot.io.vn>',
            to: [payload.email],
            subject: subject,
            html: htmlContent,
        });
    }

    async sendPaymentSuccessEmail(payload: { email: string, package_name: string, order_id: string, amount: string, paid_at: string }) {
        const subject = `[FLOW-PILOT] PAYMENT SUCCESSFUL FOR ORDER #${payload.order_id}`;

        // Replace placeholders in the template with actual values
        const htmlContent = paymentSuccessTemplate
            .replaceAll('{{subject}}', subject)
            .replaceAll('{{order_id}}', payload.order_id)
            .replaceAll('{{package_name}}', payload.package_name)
            .replaceAll('{{amount}}', payload.amount)
            .replaceAll('{{paid_at}}', payload.paid_at)

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@flowpilot.io.vn>',
            to: [payload.email],
            subject: subject,
            html: htmlContent,
        });
    }

    async sendPaymentFailureEmail(payload: { email: string, package_name: string, order_id: string, amount: string }) {
        const subject = `[FLOW-PILOT] PAYMENT FAILED FOR ORDER #${payload.order_id}`;

        // Replace placeholders in the template with actual values
        const htmlContent = paymentFailureTemplate
            .replaceAll('{{subject}}', subject)
            .replaceAll('{{order_id}}', payload.order_id)
            .replaceAll('{{package_name}}', payload.package_name)
            .replaceAll('{{amount}}', payload.amount);

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@flowpilot.io.vn>',
            to: [payload.email],
            subject: subject,
            html: htmlContent,
        });
    }

}
