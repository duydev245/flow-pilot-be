import { Injectable } from '@nestjs/common'
import { S3StorageService } from 'src/shared/services/s3-storage.service'
import { FileRepository } from './file.repo'
import { GetFileFail, InvalidFile, UploadFileFail, DeleteFileFail } from './file.error'
import { SuccessResponse } from 'src/shared/sucess'
import path from 'path'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_EXT = ['.pdf', '.txt', '.csv', '.doc', '.docx', '.xlsx']

function getExtension(filename: string) {
    const ext = path.extname(filename || '').toLowerCase()
    return ext
}

function sanitizeFilename(name: string, maxLen = 255) {
    if (!name) return 'file'
    // Normalize Unicode, remove nulls and control characters, replace path separators
    let s = name.normalize('NFC')
    s = s.replace(/\0/g, '')
    // remove control chars by filtering codepoints (avoid problematic regex ranges)
    s = Array.from(s)
        .filter(ch => {
            const code = ch.charCodeAt(0)
            return code > 31 && code !== 127
        })
        .join('')
    s = s.replace(/\//g, '_').replace(/\\/g, '_')
    s = s.trim()
    if (s.length > maxLen) s = s.slice(0, maxLen)
    return s || 'file'
}

@Injectable()
export class FileService {

    constructor(
        private readonly s3: S3StorageService,
        private readonly repo: FileRepository
    ) { }

    validateFile(file: Express.Multer.File) {
        if (!file) throw InvalidFile
        if (file.size > MAX_FILE_SIZE) throw InvalidFile
        const ext = getExtension(file.originalname)
        if (!ALLOWED_EXT.includes(ext)) throw InvalidFile
    }

    async uploadForTask(body: { user_id: string; task_id: string; file: Express.Multer.File }) {
        const { user_id, task_id, file } = body
        this.validateFile(file)
        let file_key: string
        let file_url: string
        try {
            const res = await this.s3.uploadFile(file, 'tasks')
            file_key = res.key
            file_url = res.url
        } catch (e) {
            throw UploadFileFail
        }
        const safeName = sanitizeFilename(file.originalname)
        const created = await this.repo.create({
            task_id,
            file_name: safeName,
            file_url,
            file_key,
            file_size: file.size,
            mime_type: file.mimetype,
            uploaded_by: user_id,
        })
        return SuccessResponse(`File "${created.file_name}" uploaded successfully`)
    }

    async uploadForUser(body: { user_id: string; file: Express.Multer.File }) {
        const { user_id, file } = body
        this.validateFile(file)
        let file_key: string
        let file_url: string
        try {
            const res = await this.s3.uploadFile(file, 'users')
            file_key = res.key
            file_url = res.url
        } catch (e) {
            throw UploadFileFail
        }
        const safeName = sanitizeFilename(file.originalname)
        const created = await this.repo.create({
            task_id: null,
            file_name: safeName,
            file_url,
            file_key,
            file_size: file.size,
            mime_type: file.mimetype,
            uploaded_by: user_id,
        })
        return SuccessResponse(`File "${created.file_name}" uploaded successfully`)

    }

    async deleteById(id: number) {
        const found = await this.repo.findById(id)
        if (!found) throw GetFileFail
        try {
            await this.s3.deleteFile(found.file_key)
        } catch (e) {
            throw DeleteFileFail
        }
        // delete record
        await this.repo.deleteById(id)
        return SuccessResponse('File deleted successfully')
    }

    async downloadById(id: number) {
        const found = await this.repo.findById(id)
        if (!found) throw GetFileFail
        const buffer = await this.s3.downloadFile(found.file_key)
        return { buffer, meta: found }
    }

    async getFilesByTaskId(task_id: string, page?: number, limit?: number, search?: string) {
        const result = await this.repo.findByTaskId(task_id, page, limit, search)
        return SuccessResponse('Files retrieved successfully', result)
    }

    async getFilesByUserId(user_id: string, page: number = 1, limit: number = 10, search?: string) {
        const result = await this.repo.findByUserId(user_id, page, limit, search)
        return SuccessResponse('Files retrieved successfully', result)
    }
}
