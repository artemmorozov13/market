import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { ProductResponseDto } from './dto/response-product.dto';
import { ProductEntity } from '@core/entities/product.entity';
import { AuthJwtPayload } from '@core/types/user-type';
import { ProductResponseBuilder } from './lib/product-response-builder';
import { ProductUserResolver } from './lib/product-user-resolver';
import { Roles } from '@core/enums/role-enum';
import { ProductStatusEnum } from '@core/enums/product-status-enum';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        private readonly userResolver: ProductUserResolver,
        private readonly responseBuilder: ProductResponseBuilder,
    ) {}

    async getProductsList(
        userJwt: AuthJwtPayload, 
        options?: PaginationDto
    ): Promise<ProductResponseDto> {
        const { limit = 10, skip = 0, storeId = userJwt.storeId } = options || {};
        
        // Создаем базовые условия выборки
        const where: FindOptionsWhere<ProductEntity> = {
            status: In([
                ProductStatusEnum.Accepted,
                ProductStatusEnum.Active,
            ])
        };

        // Если передан storeId, добавляем условие фильтрации по магазину
        if (storeId) {
            where.store = { id: storeId };
        }

        const [items, total] = await this.productRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: {
                updatedAt: 'DESC',
            },
            relations: ['store']
        });

        return this.responseBuilder.buildResponse(items, total, limit, skip);
    }

    async getOfferedProductsList(
        userJwt: AuthJwtPayload, 
        options?: PaginationDto
    ): Promise<ProductResponseDto> {
        const { limit = 10, skip = 0 } = options || {};

        const user = await this.userResolver.resolveUser(userJwt);
        
        const where = {
            storeUser: {
                id: user.id
            },
            store: user.store,
            status: In([
                ProductStatusEnum.Accepted,
                ProductStatusEnum.Moderation,
                ProductStatusEnum.Rejected,
            ])
        }

        const [items, total] = await this.productRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: {
                updatedAt: 'DESC',
            },
            relations: ['store']
        });

        return this.responseBuilder.buildResponse(items, total, limit, skip);
    }

    async getProductById(id: number): Promise<ProductEntity> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['storeUser']
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async createProduct(userJwt: AuthJwtPayload, createProductDto: CreateProductDto): Promise<ProductEntity> {
        const user = await this.userResolver.resolveUser(userJwt)

        switch(user.role) {
            case Roles.Admin:
                const adminProduct = this.productRepository.create({
                    ...createProductDto,
                    storeUser: user,
                    store: user.store
                });
                return this.productRepository.save(adminProduct);
            case Roles.Vendor:
                const vendorProduct = this.productRepository.create({
                    ...createProductDto,
                    storeUser: user,
                    price: null,
                    offeredPrice: createProductDto.price,
                    store: user.store,
                    status: ProductStatusEnum.Moderation
                });
                return this.productRepository.save(vendorProduct);
            default:
                throw new BadRequestException('Вы не можете создать продукт.')
        }
    }

    async updateProduct(userJwt: AuthJwtPayload, id: number, updateProductDto: UpdateProductDto): Promise<ProductEntity> {
        const user = await this.userResolver.resolveUser(userJwt);
        const product = await this.getProductById(id)

        if (product.storeUser.id !== user.id) {
            const isDiscountChanged = Math.abs(Number(product.discount) - Number(updateProductDto.discount)) > 0.001;

            if (isDiscountChanged) {
                throw new BadRequestException('Нельзя изменять размер cкидки у товара поставщика');
            }
            if (Number(updateProductDto.offeredPrice) !== Number(product.offeredPrice)) {
                throw new BadRequestException('Нельзя изменять цену предложенную поставщиком');
            }
            if (updateProductDto.unitOfMeasurement !== product.unitOfMeasurement) {
                throw new BadRequestException('Нельзя изменять меру у товара поставщика');
            }
        }
        
        switch(user.role) {
            case Roles.Admin:
                await this.productRepository.update(id, {
                    ...updateProductDto,
                    store: user.store,
                });
                return await this.productRepository.findOneBy({ id });
                
            case Roles.Vendor:
                await this.productRepository.update(id, {
                    ...updateProductDto,
                    store: user.store,
                    price: null,
                    offeredPrice: updateProductDto.price,
                    status: ProductStatusEnum.Moderation
                });
                return await this.productRepository.findOneBy({ id });
                
            default:
                throw new BadRequestException('Вы не можете редактировать продукт.');
        }
    }

    async deleteProduct(userJwt: AuthJwtPayload, id: number): Promise<void> {
        const user = await this.userResolver.resolveUser(userJwt);

        switch(user.role) {
            case Roles.Admin:
                await this.productRepository.update(
                    id,
                    {
                        status: ProductStatusEnum.Expired
                    }
                )
                return
            case Roles.Vendor:
                await this.productRepository.update(
                    id,
                    {
                        status: ProductStatusEnum.Revoked
                    }
                )
                return
        }
    }

    async setStatusAccept(userJwt: AuthJwtPayload, id: number) {
        const user = await this.userResolver.resolveUser(userJwt);

        if (user.role !== Roles.Admin) {
            throw new BadRequestException('Вы не можете одобрить продукт');
        }

        const product = await this.getProductById(id);

        await this.productRepository.update(
            id,
            {
                status: ProductStatusEnum.Accepted,
                price: product.offeredPrice
            }
        )
    }

    async setStatusRejected(userJwt: AuthJwtPayload, id: number, canelComment: string) {
        const user = await this.userResolver.resolveUser(userJwt);

        if (user.role !== Roles.Admin) {
            throw new BadRequestException('Вы не можете отклонить продукт');
        }

        await this.productRepository.update(
            id,
            {
                status: ProductStatusEnum.Rejected,
                canelComment: canelComment
            }
        )
    }

    async setStatusHidden(userJwt: AuthJwtPayload, id: number) {
        const user = await this.userResolver.resolveUser(userJwt);

        if (user.role !== Roles.Admin) {
            throw new BadRequestException('Вы не можете изменить статус');
        }

        await this.productRepository.update(
            id,
            {
                status: ProductStatusEnum.Hidden
            }
        )
    }

    async setStatusActive(userJwt: AuthJwtPayload, id: number): Promise<void> {
        const user = await this.userResolver.resolveUser(userJwt);

        if (user.role !== Roles.Admin) {
            throw new BadRequestException('Вы не можете изменить статус');
        }

        await this.productRepository.update(
            id,
            {
                status: ProductStatusEnum.Active
            }
        )
    }
}