import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthJwtPayload } from '@core/types/user-type';
import { BasketEntity } from '@core/entities/basket.entity';
import { ProductEntity } from '@core/entities/product.entity';
import { SelectedProductEntity } from '@core/entities/selected-product.entity';
import { UsersEntity } from '@core/entities/users.entity';
import { StoreService } from '@app/store/store.service';

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
    const store = await this.usersRepository.findOneBy({ id: userJwt.id });
    const user = await this.usersRepository.findOne({
      where: {
        id: userJwt.id,
        store: store
      }
    })
    return await this.selectedProductRepository.delete({
      user: {
        id: user.id,
        store: store
      }
    });
  }

  async addProductToBasket(userJwt: AuthJwtPayload, productId: number) {
    const store = await this.usersRepository.findOneBy({ id: userJwt.id });
    const user = await this.usersRepository.findOne({
      where: {
        id: userJwt.id,
        store
      },
      relations: ['basket']
    })
    const selectedProduct = await this.selectedProductRepository.findOne({
      where: {
        user: {
          id: userJwt.id,
          store
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
        store: store,
        user: user
      })
    }
    return this.selectedProductRepository.save({
      productId: productId,
      quantity: 1,
      userTgchatId: user.telegram_id,
      basket: user.basket,
      store: store,
      user: user
    })
  }

  async removeProductFromBasket(userJwt: AuthJwtPayload, productId: number) {
    const store = await this.usersRepository.findOneBy({ id: userJwt.id });
    const user = await this.usersRepository.findOne({
      where: {
        id: userJwt.id,
        store
      },
      relations: ['basket']
    })
    const selectedProduct = await this.selectedProductRepository.findOne({
      where: {
        user: { id: user.id },
        productId: productId,
        store
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
      store,
      user: user
    })
  }

  async resetBasketProduct(userJwt: AuthJwtPayload, productId: number) {
    const store = await this.usersRepository.findOneBy({ id: userJwt.id });
    const user = await this.usersRepository.findOne({
      where: {
        id: userJwt.id,
        store
      },
      relations: ['basket']
    })
    const selectedProduct = await this.selectedProductRepository.findOne({
      where: {
        productId: productId,
        user: {
          id: user.id,
          store
        }
      }
    })

    if (!selectedProduct) {
      return {
        message: "Product is not in the basket"
      }
    }

    return this.selectedProductRepository.delete(selectedProduct.id)
  }

  async getBasketById(userJwt: AuthJwtPayload): Promise<SelectedProductEntity[]> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userJwt.id
      }
    })
    const selectedProducts = await this.selectedProductRepository.find({
      where: {
        user: {
          id: user.id
        }
      },
      relations: ['product']
    });

    return selectedProducts;
  }
}
