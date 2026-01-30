import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardiansController } from './guardians.controller';
import { GuardiansService } from './guardians.service';
import { GuardianshipLink } from './entities/guardianship-link.entity';
import { ConsentRecord } from './entities/consent-record.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuardianshipLink, ConsentRecord, User])],
  controllers: [GuardiansController],
  providers: [GuardiansService],
  exports: [GuardiansService],
})
export class GuardiansModule {}
