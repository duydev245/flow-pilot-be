import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import envConfig from "../config";
import fs from "fs";
import path from "path";

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
        const htmlContent = template.replaceAll('{{subject}}', subject).replace('{{code}}', payload.code);

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
            .replace('{{name}}', payload.name)
            .replace('{{email}}', payload.email)
            .replace('{{password}}', payload.password);

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
            .replace('{{name}}', payload.name)
            .replace('{{email}}', payload.email)
            .replace('{{phone}}', payload.phone);

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
            .replace('{{name}}', payload.name)
            .replace('{{email}}', payload.email)
            .replace('{{phone}}', payload.phone)
            .replace('{{company}}', payload.company || 'N/A')
            .replace('{{package_name}}', payload.package_name)
            .replace('{{note}}', payload.note || 'N/A');

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@flowpilot.io.vn>',
            to: ['flowpilot.hrm@gmail.com'],
            subject: subject,
            html: htmlContent,
        });
    }

    async sendPaymentRequestEmail(payload: { email: string, package_name: string, order_id: string, amount: string, qr_code_url: string }) {
        const subject = `[FLOW-PILOT] PAYMENT REQUEST FOR ORDER #${payload.order_id}`;

        // Replace placeholders in the template with actual values
        const htmlContent = paymentRequestTemplate
            .replaceAll('{{subject}}', subject)
            .replace('{{order_id}}', payload.order_id)
            .replace('{{package_name}}', payload.package_name)
            .replace('{{amount}}', payload.amount)
            .replace('{{qr_code_url}}', payload.qr_code_url);

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@flowpilot.io.vn>',
            to: [payload.email],
            subject: subject,
            html: htmlContent,
        });
    }

    async sendPaymentSuccessEmail(payload: { email: string, package_name: string, order_id: string, amount: string, paid_at: string, transaction_id: string }) {
        const subject = `[FLOW-PILOT] PAYMENT SUCCESSFUL FOR ORDER #${payload.order_id}`;

        // Replace placeholders in the template with actual values
        const htmlContent = paymentSuccessTemplate
            .replaceAll('{{subject}}', subject)
            .replace('{{order_id}}', payload.order_id)
            .replace('{{package_name}}', payload.package_name)
            .replace('{{amount}}', payload.amount)
            .replace('{{paid_at}}', payload.paid_at)
            .replace('{{transaction_id}}', payload.transaction_id);

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
            .replace('{{order_id}}', payload.order_id)
            .replace('{{package_name}}', payload.package_name)
            .replace('{{amount}}', payload.amount);

        return await this.resend.emails.send({
            from: 'Flow Pilot <no-reply@flowpilot.io.vn>',
            to: [payload.email],
            subject: subject,
            html: htmlContent,
        });
    }

}
