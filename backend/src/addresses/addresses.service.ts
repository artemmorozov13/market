import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { AddressesEntity } from 'src/entities/addresses.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthJwtPayload } from 'src/auth/types/auth.jwtPayload';

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
      where: { id: user.sub },
      relations: ['addresses'] // Подгружаем связанные адреса пользователя
    });
  
    if (!userData) {
      throw new UnauthorizedException('User not found');
    }
  
    // Проверяем, есть ли у пользователя уже адрес с таким fias_id
    const existingAddress = await this.addressRepository.findOne({
      where: {
        fias_id: createAddressDto.addressData.fias_id,
        user: { id: user.sub }
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
      where: { user: { id: user.sub } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: number): Promise<AddressesEntity> {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(
    id: string,
    userId: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressesEntity> {
    const address = await this.findOne(id, userId);
    return this.addressRepository.save({
      ...address,
      ...updateAddressDto,
    });
  }

  async remove(id: string, userId: number): Promise<void> {
    const address = await this.findOne(id, userId);
    await this.addressRepository.remove(address);
  }
}