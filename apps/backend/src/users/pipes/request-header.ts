import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";

export const RequestHeaderAccessToken = createParamDecorator(
    async (targetDto: any, context: ExecutionContext) => {
        const headers = context.switchToHttp().getRequest().headers;
        const dto = plainToInstance(targetDto, headers, {
            excludeExtraneousValues: true
        })
        await validateOrReject(dto)
        return dto
    }
)