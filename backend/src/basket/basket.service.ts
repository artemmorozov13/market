import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BasketEntity } from 'src/entities/basket.entity';
import { ProductEntity } from 'src/entities/product.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { RemoveProductFromBasketDto } from './dto/remove-product-to-basket.dto';
import { SelectedProductEntity } from 'src/entities/selected-product.entity';
import { TelegramUtils } from 'src/utils/telegram.utils';
import { AuthJwtPayload } from 'src/auth/types/auth.jwtPayload';

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

  async clearBasket(user: AuthJwtPayload) {
    return await this.selectedProductRepository.delete({
      user: {
        id: user.sub
      }
    });
  }

  async addProductToBasket(userPayload: AuthJwtPayload, productId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userPayload.sub
      },
      relations: ['basket']
    })
    const selectedProduct = await this.selectedProductRepository.findOne({
      where: {
        user: {
          id: userPayload.sub
        },
        productId: productId
      }
    })
    if (selectedProduct) {
      return this.selectedProductRepository.update(selectedProduct.id, {
        productId: productId,
        quantity: selectedProduct.quantity + 1,
        userTgchatId: user.telegram_id,
        basket: user.basket,
        user: user.basket
      })
    }
    return this.selectedProductRepository.save({
      productId: productId,
      quantity: 1,
      userTgchatId: user.telegram_id,
      basket: user.basket,
      user: user.basket
    })
  }

  async removeProductFromBasket(userPayload: AuthJwtPayload, productId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userPayload.sub
      },
      relations: ['basket']
    })
    const selectedProduct = await this.selectedProductRepository.findOne({
      where: {
        user: { id: userPayload.sub },
        productId: productId
      }
    })

    if (!selectedProduct) {
      return {
        message: "Product is not in the basket"
      }
    }

    if (selectedProduct.quantity === 1) {
      return this.selectedProductRepository.delete(selectedProduct.id)
    }
    return this.selectedProductRepository.update(selectedProduct.id, {
      productId: productId,
      quantity: selectedProduct.quantity - 1,
      userTgchatId: user.telegram_id,
      basket: user.basket,
      user: user.basket
    })
  }

  async resetBasketProduct(userData: AuthJwtPayload, productId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userData.sub
      },
      relations: ['basket']
    })
    const selectedProduct = await this.selectedProductRepository.findOne({
      where: {
        userTgchatId: user.telegram_id,
        productId: productId
      }
    })

    if (!selectedProduct) {
      return {
        message: "Product is not in the basket"
      }
    }

    return this.selectedProductRepository.delete(selectedProduct.id)
  }

  async getBasketById(userPayload: AuthJwtPayload): Promise<SelectedProductEntity[]> {

    const selectedProducts = await this.selectedProductRepository.find({
      where: {
        user: {
          id: userPayload.sub
        }
      },
      relations: ['product']
    });

    return selectedProducts;
  }
}
