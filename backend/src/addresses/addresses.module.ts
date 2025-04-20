import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesEntity } from 'src/entities/addresses.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersEntity } from 'src/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AddressesEntity,
      UsersEntity
    ]),
    AuthModule
  ],
  providers: [AddressesService],
  controllers: [AddressesController]
})
export class AddressesModule {}
