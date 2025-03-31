import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BasketEntity } from 'src/entities/basket.entity';
import { ProductEntity } from 'src/entities/product.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { RemoveProductFromBasketDto } from './dto/remove-product-to-basket.dto';
import { SelectedProductEntity } from 'src/entities/selected-product.entity';
import { TelegramUtils } from 'src/utils/telegram.utils';

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

  async clearBasket(initData: string) {
    const telegramUser = TelegramUtils.parseInitData(initData)
    return await this.selectedProductRepository.delete({
      userTgchatId: telegramUser.id
    });
  }

  async addProductToBasket(initData: string, productId: number) {
    const telegramUser = TelegramUtils.parseInitData(initData)
    const user = await this.usersRepository.findOne({
      where: {
        telegram_id: telegramUser.id
      },
      relations: ['basket']
    })
    const selectedProduct = await this.selectedProductRepository.findOne({
      where: {
        userTgchatId: telegramUser.id,
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

  async removeProductFromBasket(initData: string, productId: number) {
    const telegramUser = TelegramUtils.parseInitData(initData)
    const user = await this.usersRepository.findOne({
      where: {
        telegram_id: telegramUser.id
      },
      relations: ['basket']
    })
    const selectedProduct = await this.selectedProductRepository.findOne({
      where: {
        userTgchatId: telegramUser.id,
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
  

  async getBasketById(initData: string): Promise<SelectedProductEntity[]> {
    const telegramUser = TelegramUtils.parseInitData(initData)
    const selectedProducts = await this.selectedProductRepository.find({
      where: { userTgchatId: telegramUser.id },
      relations: ['product']
    });

    return selectedProducts;
  }
}
