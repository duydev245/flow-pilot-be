import z from 'zod'
import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

config({
  path: '.env',
})

// Kiểm tra coi thử có file .env hay chưa
if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Can not find file .env')
  process.exit(1)
}

const configSchema = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  SECRET_API_KEY: z.string(),
  GENERAL_NAME: z.string(),
  GENERAL_PASSWORD: z.string(),
  SUPERADMIN_EMAIL: z.string(),
  ADMIN_EMAIL: z.string(),
  MANAGER_EMAIL: z.string(),
  EMPLOYEE_EMAIL: z.string(),
  OTP_EXPIRES_IN: z.string(),
  RESEND_API_KEY: z.string(),
  GPT_API_KEY: z.string(),
  OPENAI_MODEL: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  PAYMENT_API_KEY: z.string(),
  // S3_ENPOINT: z.string(),
  // REDIS_URL: z.string(),
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.log('The declared values in the .env file are invalid.')
  console.error(configServer.error)
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
