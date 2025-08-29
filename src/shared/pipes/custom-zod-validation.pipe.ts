import { UnprocessableEntityException } from "@nestjs/common"
import { createZodValidationPipe, ZodValidationPipe } from "nestjs-zod"
import { ZodError } from "zod"

const CustomZodValidationPipe: typeof ZodValidationPipe = createZodValidationPipe({
    // provide custom validation exception factory
    createValidationException: (error: ZodError) => {
        console.log()
        return new UnprocessableEntityException(
            error.issues.map((error) => {
                return {
                    ...error,
                    path: error.path.join('.'),
                }
            }),
        )
    },
})

export default CustomZodValidationPipe
