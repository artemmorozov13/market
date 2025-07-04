import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthJwtPayload } from '@core/types/user-type';
import { BasketEntity } from '@core/entities/basket.entity';
import { ProductEntity } from '@core/entities/product.entity';
import { SelectedProductEntity } from '@core/entities/selected-product.entity';
import { UsersEntity } from '@core/entities/users.entity';

@Injectable()
export class BasketService {
  constructor(
    @InjectRepository(BasketEntity)
    private readonly basketRepository: Repository<BasketEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(SelectedProductEntity)
    private readonly selectedProductRepository: Repository<SelectedProductEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async createBasket(user: UsersEntity): Promise<BasketEntity> {
    const basket = this.basketRepository.create({
      telegram_id: user.telegram_id,
      user
    });
    return this.basketRepository.save(basket);
  }

  async clearBasket(userJwt: AuthJwtPayload) {
    const user = await this.usersRepository.findOne({
      where: { id: userJwt.id },
      relations: ['basket']
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.selectedProductRepository.delete({
      user: { id: user.id }
    });
  }

  async addProductToBasket(userJwt: AuthJwtPayload, productId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userJwt.id },
      relations: ['basket']
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const product = await this.productRepository.findOne({ 
      where: { id: productId },
      relations: ['store']
    });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingProduct = await this.selectedProductRepository.findOne({
      where: {
        user: { id: user.id },
        product: { id: productId }
      },
      relations: ['product', 'store']
    });

    if (existingProduct) {
      existingProduct.quantity += 1;
      return this.selectedProductRepository.save(existingProduct);
    }

    const newSelectedProduct = this.selectedProductRepository.create({
      quantity: 1,
      basket: user.basket,
      store: product.store, // Используем store из продукта
      user: user,
      product: product
    });

    return this.selectedProductRepository.save(newSelectedProduct);
  }

  async removeProductFromBasket(userJwt: AuthJwtPayload, productId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userJwt.id }
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const selectedProduct = await this.selectedProductRepository.findOne({
      where: {
        user: { id: user.id },
        product: { id: productId }
      },
      relations: ['product', 'store']
    });

    if (!selectedProduct) {
      throw new NotFoundException('Product is not in the basket');
    }

    if (selectedProduct.quantity === 1) {
      await this.selectedProductRepository.delete(selectedProduct.id);
      return { quantity: 0 };
    }

    selectedProduct.quantity -= 1;
    await this.selectedProductRepository.save(selectedProduct);
    return selectedProduct;
  }

  async resetBasketProduct(userJwt: AuthJwtPayload, productId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userJwt.id }
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const selectedProduct = await this.selectedProductRepository.findOne({
      where: {
        product: { id: productId },
        user: { id: user.id }
      },
      relations: ['product', 'store']
    });

    if (!selectedProduct) {
      throw new NotFoundException('Product is not in the basket');
    }

    await this.selectedProductRepository.delete(selectedProduct.id);
    return { message: 'Product removed from basket' };
  }

  async getBasketById(userJwt: AuthJwtPayload): Promise<SelectedProductEntity[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userJwt.id }
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.selectedProductRepository.find({
      where: {
        user: { id: user.id }
      },
      relations: ['product', 'store'],
      order: {
        id: 'ASC' // Сортировка по ID в порядке добавления
      }
    });
  }
}