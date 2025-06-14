import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthJwtPayload } from '@core/types/user-type';
import { AddressesEntity } from '@core/entities/addresses.entity';
import { UsersEntity } from '@core/entities/users.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(AddressesEntity)
    private readonly addressRepository: Repository<AddressesEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async create(user: AuthJwtPayload, createAddressDto: CreateAddressDto) {
    const userData = await this.usersRepository.findOne({ 
      where: { id: user.id },
      relations: ['addresses'] // Подгружаем связанные адреса пользователя
    });
  
    if (!userData) {
      throw new UnauthorizedException('User not found');
    }
  
    // Проверяем, есть ли у пользователя уже адрес с таким fias_id
    const existingAddress = await this.addressRepository.findOne({
      where: {
        fias_id: createAddressDto.addressData.fias_id,
        user: { id: user.id }
      }
    });
  
    if (existingAddress) {
      throw new ConflictException('Address with this fias_id already exists for this user');
    }
  
    const address = this.addressRepository.create({
      apartment: createAddressDto.apartment,
      entrance: createAddressDto.entrance,
      floor: createAddressDto.floor,
      fias_id: createAddressDto.addressData.fias_id,
      fullAddress: createAddressDto.fullAddress,
      geo_lat: createAddressDto.addressData.geo_lat,
      geo_lon: createAddressDto.addressData.geo_lon,
      intercom: createAddressDto.intercom,
      postal_code: createAddressDto.addressData.postal_code,
      user: userData,
    });
  
    return this.addressRepository.save(address);
  }

  async findAllByUser(user: AuthJwtPayload): Promise<AddressesEntity[]> {
    return this.addressRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userPayload: AuthJwtPayload, addressId: string): Promise<AddressesEntity> {
    const address = await this.addressRepository.findOne({
      where: {
        id: addressId,
        user: {
          id: userPayload.id
        }
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(
    user: AuthJwtPayload,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressesEntity> {
    const address = await this.findOne(user, updateAddressDto.id);
    return this.addressRepository.save({
      ...address,
      ...updateAddressDto,
    });
  }

  async remove(addressId: string, user: AuthJwtPayload): Promise<void> {
    const address = await this.findOne(user, addressId);
    await this.addressRepository.remove(address);
  }
}