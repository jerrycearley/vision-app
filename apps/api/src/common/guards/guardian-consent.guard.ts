import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GuardianshipLink, GuardianshipStatus } from '../../guardians/entities/guardianship-link.entity';

export const REQUIRES_GUARDIAN = 'requiresGuardian';

@Injectable()
export class GuardianConsentGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(GuardianshipLink)
    private guardianshipRepository: Repository<GuardianshipLink>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresGuardian = this.reflector.getAllAndOverride<boolean>(REQUIRES_GUARDIAN, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiresGuardian) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // If user is not a minor, allow access
    if (!user.isMinor) {
      return true;
    }

    // Check if user has an active guardian
    const guardianship = await this.guardianshipRepository.findOne({
      where: {
        minorId: userId,
        status: GuardianshipStatus.ACTIVE,
      },
    });

    if (!guardianship || !guardianship.consentGivenAt) {
      throw new ForbiddenException(
        'Guardian consent required. Please ask your guardian to approve this action.',
      );
    }

    return true;
  }
}
