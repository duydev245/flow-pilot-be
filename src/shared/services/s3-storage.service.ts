import { Injectable } from '@nestjs/common';
import { S3, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import envConfig from '../config';
interface IStorageService {
    uploadFile(file: Express.Multer.File): Promise<{ url: string, key: string }>;
    downloadFile(key: string): Promise<Buffer>;
}

@Injectable()
export class S3StorageService implements IStorageService {
    private readonly s3: S3;
    private readonly bucketName: string;

    constructor() {
        this.s3 = new S3({
            region: envConfig.S3_REGION,
            credentials: {
                accessKeyId: envConfig.S3_ACCESS_KEY,
                secretAccessKey: envConfig.S3_SECRET_KEY,
            },
        });
        this.bucketName = envConfig.S3_BUCKET_NAME;
    }

    async uploadFile(file: Express.Multer.File): Promise<{ url: string, key: string }> {
        const key = `${Date.now()}_${file.originalname}`;

        const body = Readable.from(file.buffer);

        const upload = new Upload({
            client: this.s3,
            params: {
                Bucket: this.bucketName,
                Key: key,
                Body: body,
                ContentType: file.mimetype,
            },
            queueSize: 4,           // concurrent uploads
            partSize: 5 * 1024 * 1024, // 5 MB parts
            leavePartsOnError: false,
        });

        const result = await upload.done();

        return { url: result.Location || '', key };
    }

    async downloadFile(key: string): Promise<Buffer> {
        const response = await this.s3.send(new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        }));

        if (!response.Body) {
            throw new Error(`S3 object ${key} has no body`);
        }

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
