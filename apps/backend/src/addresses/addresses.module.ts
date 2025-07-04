import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersEntity } from '@core/entities/users.entity';
import { AddressesEntity } from '@core/entities/addresses.entity';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AddressesEntity
    ]),
    AuthModule,
    UsersModule
  ],
  providers: [AddressesService],
  controllers: [AddressesController]
})
export class AddressesModule {}
