import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import refreshJwtConfig from "../config/refresh-jwt.config";
import { AuthJwtPayload } from "@core/types/user-type";
import { Roles } from "@core/enums/role-enum";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
    constructor(
        @Inject(refreshJwtConfig.KEY) private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
        private authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: refreshJwtConfiguration.secret,
            ignoreExpiration: false
        })
    }

    async validate(payload: AuthJwtPayload) {
        console.log(payload)
        switch (payload.role) {
            case Roles.User:
                await this.authService.validateUser(payload);
                return payload;
            case Roles.Admin:
                await this.authService.validateStoreUser(payload);
                return payload
            default:
                throw new UnauthorizedException("Не удалось получить данные пользователя");
        }
    }
}