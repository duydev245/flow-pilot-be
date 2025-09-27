import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
interface IStorageService {
    uploadFile(file: Express.Multer.File): Promise<string>;
    downloadFile(key: string): Promise<Buffer>;
}

@Injectable()
export class S3StorageService implements IStorageService {
    private readonly s3: S3Client;
    private readonly bucketName: string;

    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
        this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const key = `${Date.now()}_${file.originalname}`;
        await this.s3.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        return key;
    }

    async downloadFile(key: string): Promise<Buffer> {
        const response = await this.s3.send(new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        }));
        const stream = response.Body as Readable;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        return Buffer.concat(chunks);
    }

    async deleteFile(key: string): Promise<void> {
        await this.s3.send(new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        }));
    }


    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        return await getSignedUrl(this.s3, command, { expiresIn });
    }


}

