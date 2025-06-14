import { StoreUserEntity } from '@core/entities/store-user.entity';
import { BadRequestException, ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { StoreService } from '@app/store/store.service';
import * as bcrypt from "bcryptjs"
import { Roles } from '@core/enums/role-enum';

@Injectable()
export class StoreUserService {
    constructor(
        @InjectRepository(StoreUserEntity)
        private readonly storeUserRepository: Repository<StoreUserEntity>,
        @Inject(forwardRef(() => StoreService))
        private readonly storeService: StoreService
    ) {}

    async getStoreUserByEmail(email: string) {
        const user = await this.storeUserRepository.findOne({
            where: {
                email: email
            },
            relations: ["store"]
        })

        if (!user) {
            throw new BadRequestException("Польщователь с этими учетными данными не найден")
        }

        return user
    }

    async getStoreUserById(userId: number) {
        const user = await this.storeUserRepository.findOne({
            where: {
                id: userId
            },
            relations: ['store']
        })

        if (!user) {
            throw new BadRequestException("Пользователь не найден")
        }

        return user
    }

    async createUser(body: CreateUserDto) {
        const existingUser = await this.storeUserRepository.findOne({
            where: { email: body.email },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с такой почтой уже существует');
        }

        const hashedPassword = await bcrypt.hash('123456', 10);

        const user = this.storeUserRepository.create({
            email: body.email,
            password: hashedPassword,
            role: Roles.Admin
        });

        return this.storeUserRepository.save(user);
    }
}
