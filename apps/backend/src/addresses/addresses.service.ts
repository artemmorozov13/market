import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthJwtPayload } from '@core/types/user-type';
import { AddressesEntity } from '@core/entities/addresses.entity';
import { UsersEntity } from '@core/entities/users.entity';
import { UsersService } from '@app/users/users.service';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(AddressesEntity)
    private readonly addressRepository: Repository<AddressesEntity>,
    private readonly usersService: UsersService
  ) {}

  async create(userJwt: AuthJwtPayload, createAddressDto: CreateAddressDto) {
    const user = await this.usersService.getUserById(userJwt.id);
  
    const existingAddress = await this.addressRepository.findOne({
      where: {
        fias_id: createAddressDto.addressData.fias_id,
        user: user
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
      user: user,
      selectedByUser: user
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
      throw new NotFoundException('Адрес не найден');
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

  async updateSelectedAddress(userJwt: AuthJwtPayload, addressId: string) {
    const address = await this.findOne(userJwt, addressId);

    return await this.usersService.updateSelectedAddress(userJwt, address)
  }

  async remove(addressId: string, user: AuthJwtPayload): Promise<void> {
    const address = await this.findOne(user, addressId);
    await this.addressRepository.remove(address);
  }
}