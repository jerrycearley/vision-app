import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { GuardianshipLink, GuardianshipStatus, GuardianRelationship } from './entities/guardianship-link.entity';
import { ConsentRecord } from './entities/consent-record.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GuardiansService {
  constructor(
    @InjectRepository(GuardianshipLink)
    private guardianshipRepository: Repository<GuardianshipLink>,
    @InjectRepository(ConsentRecord)
    private consentRepository: Repository<ConsentRecord>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async inviteGuardian(
    minorId: string,
    guardianEmail: string,
    relationship: GuardianRelationship = GuardianRelationship.PARENT,
  ) {
    const minor = await this.userRepository.findOne({ where: { id: minorId } });
    if (!minor) {
      throw new NotFoundException('User not found');
    }

    if (!minor.isMinor) {
      throw new BadRequestException('Only minors can add guardians');
    }

    // Check if guardian already exists
    const existingGuardian = await this.userRepository.findOne({
      where: { email: guardianEmail.toLowerCase() },
    });

    const invitationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to accept

    const guardianship = this.guardianshipRepository.create({
      minorId,
      guardianId: existingGuardian?.id,
      relationship,
      status: GuardianshipStatus.PENDING,
      invitationToken,
      invitationExpiresAt: expiresAt,
    });

    await this.guardianshipRepository.save(guardianship);

    // In production, send email invitation here
    return {
      id: guardianship.id,
      invitationToken,
      expiresAt,
      message: 'Guardian invitation sent',
    };
  }

  async acceptInvitation(guardianId: string, invitationToken: string) {
    const guardianship = await this.guardianshipRepository.findOne({
      where: { invitationToken },
      relations: ['minor'],
    });

    if (!guardianship) {
      throw new NotFoundException('Invitation not found');
    }

    if (guardianship.invitationExpiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    if (guardianship.status !== GuardianshipStatus.PENDING) {
      throw new BadRequestException('Invitation already processed');
    }

    guardianship.guardianId = guardianId;
    guardianship.status = GuardianshipStatus.ACTIVE;
    guardianship.consentGivenAt = new Date();
    guardianship.invitationToken = null;

    await this.guardianshipRepository.save(guardianship);

    return guardianship;
  }

  async getGuardiansForMinor(minorId: string) {
    return this.guardianshipRepository.find({
      where: { minorId },
      relations: ['guardian'],
    });
  }

  async getMinorsForGuardian(guardianId: string) {
    return this.guardianshipRepository.find({
      where: { guardianId, status: GuardianshipStatus.ACTIVE },
      relations: ['minor'],
    });
  }

  async hasActiveGuardian(minorId: string): Promise<boolean> {
    const count = await this.guardianshipRepository.count({
      where: { minorId, status: GuardianshipStatus.ACTIVE },
    });
    return count > 0;
  }

  async grantConsent(
    guardianId: string,
    minorId: string,
    connectorType: string,
    scopes: string[],
    dataCategories: string[],
  ) {
    // Verify guardianship
    const guardianship = await this.guardianshipRepository.findOne({
      where: {
        guardianId,
        minorId,
        status: GuardianshipStatus.ACTIVE,
      },
    });

    if (!guardianship) {
      throw new ForbiddenException('You are not a guardian of this user');
    }

    const consent = this.consentRepository.create({
      userId: minorId,
      connectorType,
      scopes,
      dataCategories,
      consentGivenAt: new Date(),
      guardianApprovalRequired: true,
      guardianApprovedAt: new Date(),
      guardianId,
    });

    await this.consentRepository.save(consent);

    return consent;
  }

  async revokeConsent(guardianId: string, consentId: string) {
    const consent = await this.consentRepository.findOne({
      where: { id: consentId },
    });

    if (!consent) {
      throw new NotFoundException('Consent record not found');
    }

    // Verify guardianship
    const guardianship = await this.guardianshipRepository.findOne({
      where: {
        guardianId,
        minorId: consent.userId,
        status: GuardianshipStatus.ACTIVE,
      },
    });

    if (!guardianship) {
      throw new ForbiddenException('You are not a guardian of this user');
    }

    consent.revokedAt = new Date();
    await this.consentRepository.save(consent);

    return consent;
  }

  async getConsentRecords(userId: string) {
    return this.consentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async hasConsentFor(userId: string, connectorType: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.isMinor) {
      return true; // Adults don't need guardian consent
    }

    const consent = await this.consentRepository.findOne({
      where: {
        userId,
        connectorType,
        revokedAt: IsNull(),
      },
    });

    return !!consent && !!consent.guardianApprovedAt;
  }

  async revokeGuardianship(guardianId: string, guardianshipId: string) {
    const guardianship = await this.guardianshipRepository.findOne({
      where: { id: guardianshipId, guardianId },
    });

    if (!guardianship) {
      throw new NotFoundException('Guardianship not found');
    }

    guardianship.status = GuardianshipStatus.REVOKED;
    await this.guardianshipRepository.save(guardianship);

    return guardianship;
  }
}
