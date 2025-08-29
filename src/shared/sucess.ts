import { MessageResType } from "./models/response.model";

export const SuccessResponse = (message: string, data: any): MessageResType => {
    return {
        success: true,
        message,
        data
    }
}
