import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GuardiansService } from './guardians.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  InviteGuardianDto,
  AcceptInvitationDto,
  GrantConsentDto,
  RevokeConsentDto,
} from './dto/guardians.dto';
import { GuardianRelationship } from './entities/guardianship-link.entity';

@ApiTags('guardians')
@Controller('guardians')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post('invite')
  @ApiOperation({ summary: 'Invite a guardian (for minors)' })
  @ApiResponse({ status: 201, description: 'Guardian invitation sent' })
  async inviteGuardian(@Request() req, @Body() dto: InviteGuardianDto) {
    const relationship = dto.relationship
      ? (dto.relationship as unknown as GuardianRelationship)
      : GuardianRelationship.PARENT;
    return this.guardiansService.inviteGuardian(
      req.user.userId,
      dto.guardianEmail,
      relationship,
    );
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept a guardian invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  async acceptInvitation(@Request() req, @Body() dto: AcceptInvitationDto) {
    return this.guardiansService.acceptInvitation(req.user.userId, dto.invitationToken);
  }

  @Get('my-guardians')
  @ApiOperation({ summary: 'Get guardians for current user (minor)' })
  @ApiResponse({ status: 200, description: 'List of guardians' })
  async getMyGuardians(@Request() req) {
    return this.guardiansService.getGuardiansForMinor(req.user.userId);
  }

  @Get('my-minors')
  @ApiOperation({ summary: 'Get minors under current guardian' })
  @ApiResponse({ status: 200, description: 'List of minors' })
  async getMyMinors(@Request() req) {
    return this.guardiansService.getMinorsForGuardian(req.user.userId);
  }

  @Post('consent')
  @ApiOperation({ summary: 'Grant consent for a minor (guardian only)' })
  @ApiResponse({ status: 201, description: 'Consent granted' })
  async grantConsent(@Request() req, @Body() dto: GrantConsentDto) {
    return this.guardiansService.grantConsent(
      req.user.userId,
      dto.minorId,
      dto.connectorType,
      dto.scopes,
      dto.dataCategories,
    );
  }

  @Delete('consent/:id')
  @ApiOperation({ summary: 'Revoke consent for a minor (guardian only)' })
  @ApiResponse({ status: 200, description: 'Consent revoked' })
  async revokeConsent(@Request() req, @Param('id') consentId: string) {
    return this.guardiansService.revokeConsent(req.user.userId, consentId);
  }

  @Get('consent/:minorId')
  @ApiOperation({ summary: 'Get consent records for a minor' })
  @ApiResponse({ status: 200, description: 'Consent records' })
  async getConsentRecords(@Param('minorId') minorId: string) {
    return this.guardiansService.getConsentRecords(minorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke guardianship' })
  @ApiResponse({ status: 200, description: 'Guardianship revoked' })
  async revokeGuardianship(@Request() req, @Param('id') guardianshipId: string) {
    return this.guardiansService.revokeGuardianship(req.user.userId, guardianshipId);
  }
}
