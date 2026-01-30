import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConnectorsController } from './connectors.controller';
import { ConnectorsService } from './connectors.service';
import { GoogleConnectorService } from './services/google-connector.service';
import { UploadConnectorService } from './services/upload-connector.service';
import { Connector } from './entities/connector.entity';
import { InterestSignal } from './entities/interest-signal.entity';
import { ConsentRecord } from '../guardians/entities/consent-record.entity';
import { User } from '../users/entities/user.entity';
import { GuardiansModule } from '../guardians/guardians.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Connector, InterestSignal, ConsentRecord, User]),
    ConfigModule,
    GuardiansModule,
  ],
  controllers: [ConnectorsController],
  providers: [ConnectorsService, GoogleConnectorService, UploadConnectorService],
  exports: [ConnectorsService],
})
export class ConnectorsModule {}
