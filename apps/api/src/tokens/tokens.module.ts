import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { TokenSettings } from './entities/token-settings.entity';
import { TokenBalance } from './entities/token-balance.entity';
import { TokenLedgerEntry } from './entities/token-ledger-entry.entity';
import { TokenLockStatus } from './entities/token-lock-status.entity';
import { User } from '../users/entities/user.entity';
import { GuardiansModule } from '../guardians/guardians.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenSettings, TokenBalance, TokenLedgerEntry, TokenLockStatus, User]),
    ConfigModule,
    forwardRef(() => GuardiansModule),
  ],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
