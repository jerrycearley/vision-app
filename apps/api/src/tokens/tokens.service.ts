import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TokenSettings } from './entities/token-settings.entity';
import { TokenBalance } from './entities/token-balance.entity';
import { TokenLedgerEntry, TokenTransactionType, TokenReferenceType } from './entities/token-ledger-entry.entity';
import { TokenLockStatus, LockReason } from './entities/token-lock-status.entity';
import { User } from '../users/entities/user.entity';
import { TOKEN_DEFAULTS } from '@vision/shared';

export interface TokenIssuanceRequest {
  userId: string;
  amount: number;
  reason: TokenReferenceType;
  referenceId: string;
  description: string;
  applyMinorLock: boolean;
}

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(TokenSettings)
    private settingsRepository: Repository<TokenSettings>,
    @InjectRepository(TokenBalance)
    private balanceRepository: Repository<TokenBalance>,
    @InjectRepository(TokenLedgerEntry)
    private ledgerRepository: Repository<TokenLedgerEntry>,
    @InjectRepository(TokenLockStatus)
    private lockStatusRepository: Repository<TokenLockStatus>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async getSettings(): Promise<TokenSettings> {
    let settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings) {
      settings = this.settingsRepository.create({
        tokenName: TOKEN_DEFAULTS.NAME,
        tokenSymbol: TOKEN_DEFAULTS.SYMBOL,
        decimals: TOKEN_DEFAULTS.DECIMALS,
        defaultLockDurationDays: TOKEN_DEFAULTS.MINOR_LOCK_DURATION_DAYS,
        minorLockEnabled: true,
        onChainEnabled: false,
      });
      await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async getBalance(userId: string): Promise<TokenBalance> {
    let balance = await this.balanceRepository.findOne({ where: { userId } });
    if (!balance) {
      balance = this.balanceRepository.create({
        userId,
        availableBalance: 0,
        lockedBalance: 0,
        pendingBalance: 0,
      });
      await this.balanceRepository.save(balance);
    }
    return balance;
  }

  async getLockStatus(userId: string): Promise<TokenLockStatus | null> {
    return this.lockStatusRepository.findOne({
      where: { userId, isLocked: true },
      order: { unlockDate: 'ASC' },
    });
  }

  async getLedgerHistory(
    userId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<{ entries: TokenLedgerEntry[]; total: number }> {
    const [entries, total] = await this.ledgerRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });

    return { entries, total };
  }

  async issueTokens(request: TokenIssuanceRequest): Promise<TokenLedgerEntry> {
    const settings = await this.getSettings();
    const balance = await this.getBalance(request.userId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const balanceBefore = Number(balance.availableBalance);
      const lockedBefore = Number(balance.lockedBalance);

      let newAvailable = balanceBefore;
      let newLocked = lockedBefore;

      if (request.applyMinorLock && settings.minorLockEnabled) {
        // Add to locked balance for minors
        newLocked = lockedBefore + request.amount;

        // Create or update lock status
        let lockStatus = await this.lockStatusRepository.findOne({
          where: { userId: request.userId, lockReason: LockReason.MINOR_PROTECTION },
        });

        const unlockDate = new Date();
        unlockDate.setDate(unlockDate.getDate() + settings.defaultLockDurationDays);

        if (!lockStatus) {
          lockStatus = this.lockStatusRepository.create({
            userId: request.userId,
            isLocked: true,
            lockedAmount: request.amount,
            lockReason: LockReason.MINOR_PROTECTION,
            lockStartDate: new Date(),
            unlockDate,
          });
        } else {
          lockStatus.lockedAmount = Number(lockStatus.lockedAmount) + request.amount;
          lockStatus.isLocked = true;
        }

        await queryRunner.manager.save(lockStatus);
      } else {
        // Add to available balance
        newAvailable = balanceBefore + request.amount;
      }

      // Update balance
      balance.availableBalance = newAvailable;
      balance.lockedBalance = newLocked;
      await queryRunner.manager.save(balance);

      // Create ledger entry
      const ledgerEntry = this.ledgerRepository.create({
        userId: request.userId,
        type: TokenTransactionType.EARN,
        amount: request.amount,
        balanceBefore,
        balanceAfter: newAvailable,
        lockedBalanceBefore: lockedBefore,
        lockedBalanceAfter: newLocked,
        referenceType: request.reason,
        referenceId: request.referenceId,
        description: request.description,
      });

      await queryRunner.manager.save(ledgerEntry);
      await queryRunner.commitTransaction();

      return ledgerEntry;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transferTokens(
    fromUserId: string,
    toUserId: string,
    amount: number,
    notes?: string,
  ): Promise<{ fromEntry: TokenLedgerEntry; toEntry: TokenLedgerEntry }> {
    const fromUser = await this.userRepository.findOne({ where: { id: fromUserId } });
    if (!fromUser) {
      throw new NotFoundException('User not found');
    }
    const fromBalance = await this.getBalance(fromUserId);

    // Check if user is a minor with locked tokens
    if (fromUser.isMinor) {
      throw new ForbiddenException('Minors cannot transfer tokens. Tokens are locked until you turn 18.');
    }

    if (Number(fromBalance.availableBalance) < amount) {
      throw new BadRequestException('Insufficient available balance');
    }

    const toBalance = await this.getBalance(toUserId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Deduct from sender
      const fromBalanceBefore = Number(fromBalance.availableBalance);
      fromBalance.availableBalance = fromBalanceBefore - amount;
      await queryRunner.manager.save(fromBalance);

      const fromEntry = this.ledgerRepository.create({
        userId: fromUserId,
        type: TokenTransactionType.TRANSFER_OUT,
        amount,
        balanceBefore: fromBalanceBefore,
        balanceAfter: Number(fromBalance.availableBalance),
        lockedBalanceBefore: Number(fromBalance.lockedBalance),
        lockedBalanceAfter: Number(fromBalance.lockedBalance),
        description: notes || `Transfer to user ${toUserId}`,
      });
      await queryRunner.manager.save(fromEntry);

      // Add to recipient
      const toBalanceBefore = Number(toBalance.availableBalance);
      toBalance.availableBalance = toBalanceBefore + amount;
      await queryRunner.manager.save(toBalance);

      const toEntry = this.ledgerRepository.create({
        userId: toUserId,
        type: TokenTransactionType.TRANSFER_IN,
        amount,
        balanceBefore: toBalanceBefore,
        balanceAfter: Number(toBalance.availableBalance),
        lockedBalanceBefore: Number(toBalance.lockedBalance),
        lockedBalanceAfter: Number(toBalance.lockedBalance),
        description: notes || `Transfer from user ${fromUserId}`,
      });
      await queryRunner.manager.save(toEntry);

      await queryRunner.commitTransaction();

      return { fromEntry, toEntry };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkAndUnlockTokens(userId: string): Promise<{ unlocked: boolean; amount: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is still a minor
    if (user.isMinor && user.dateOfBirth) {
      const today = new Date();
      const birth = new Date(user.dateOfBirth);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (age < 18 || (age === 18 && monthDiff < 0)) {
        return { unlocked: false, amount: 0 };
      }

      // User has turned 18, update their status
      user.isMinor = false;
      await this.userRepository.save(user);
    }

    const lockStatus = await this.lockStatusRepository.findOne({
      where: { userId, isLocked: true, lockReason: LockReason.MINOR_PROTECTION },
    });

    if (!lockStatus) {
      return { unlocked: false, amount: 0 };
    }

    // Check if unlock date has passed or user is no longer a minor
    const now = new Date();
    if (lockStatus.unlockDate > now && user.isMinor) {
      return { unlocked: false, amount: 0 };
    }

    // Unlock tokens
    const balance = await this.getBalance(userId);
    const amountToUnlock = Number(lockStatus.lockedAmount);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const availableBefore = Number(balance.availableBalance);
      const lockedBefore = Number(balance.lockedBalance);

      balance.availableBalance = availableBefore + amountToUnlock;
      balance.lockedBalance = lockedBefore - amountToUnlock;
      await queryRunner.manager.save(balance);

      lockStatus.isLocked = false;
      lockStatus.lockedAmount = 0;
      await queryRunner.manager.save(lockStatus);

      const ledgerEntry = this.ledgerRepository.create({
        userId,
        type: TokenTransactionType.UNLOCK,
        amount: amountToUnlock,
        balanceBefore: availableBefore,
        balanceAfter: Number(balance.availableBalance),
        lockedBalanceBefore: lockedBefore,
        lockedBalanceAfter: Number(balance.lockedBalance),
        description: 'Tokens unlocked - user reached legal age',
      });
      await queryRunner.manager.save(ledgerEntry);

      await queryRunner.commitTransaction();

      return { unlocked: true, amount: amountToUnlock };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async verifyLedgerIntegrity(userId: string): Promise<{ valid: boolean; discrepancy?: number }> {
    const balance = await this.getBalance(userId);
    const entries = await this.ledgerRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    let calculatedAvailable = 0;
    let calculatedLocked = 0;

    for (const entry of entries) {
      switch (entry.type) {
        case TokenTransactionType.EARN:
          if (entry.lockedBalanceAfter > entry.lockedBalanceBefore) {
            calculatedLocked += Number(entry.amount);
          } else {
            calculatedAvailable += Number(entry.amount);
          }
          break;
        case TokenTransactionType.TRANSFER_IN:
          calculatedAvailable += Number(entry.amount);
          break;
        case TokenTransactionType.TRANSFER_OUT:
        case TokenTransactionType.SPEND:
          calculatedAvailable -= Number(entry.amount);
          break;
        case TokenTransactionType.UNLOCK:
          calculatedLocked -= Number(entry.amount);
          calculatedAvailable += Number(entry.amount);
          break;
        case TokenTransactionType.LOCK:
          calculatedAvailable -= Number(entry.amount);
          calculatedLocked += Number(entry.amount);
          break;
      }
    }

    const actualTotal = Number(balance.availableBalance) + Number(balance.lockedBalance);
    const calculatedTotal = calculatedAvailable + calculatedLocked;
    const discrepancy = Math.abs(actualTotal - calculatedTotal);

    return {
      valid: discrepancy < 0.00000001, // Allow for floating point errors
      discrepancy: discrepancy > 0 ? discrepancy : undefined,
    };
  }
}
