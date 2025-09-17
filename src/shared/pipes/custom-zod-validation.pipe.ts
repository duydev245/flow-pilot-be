import { BadRequestException } from "@nestjs/common"
import { createZodValidationPipe, ZodValidationPipe } from "nestjs-zod"
import { ZodError } from "zod"

const CustomZodValidationPipe: typeof ZodValidationPipe = createZodValidationPipe({
    // provide custom validation exception factory
    createValidationException: (error: ZodError) => {
        // format zod error issues
        const formattedErrors = error.issues.map((issue) => ({
            field: issue.input,
            path: issue.path.join('.'),
            message: issue.message,
        }))

        return new BadRequestException({
            statusCode: 400,
            error: 'Validation Error',
            issues: formattedErrors,
        })
    },
})

export default CustomZodValidationPipe
