import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsArray, IsOptional, IsEnum } from 'class-validator';

export enum GuardianRelationshipDto {
  PARENT = 'parent',
  LEGAL_GUARDIAN = 'legal_guardian',
  OTHER = 'other',
}

export class InviteGuardianDto {
  @ApiProperty({ example: 'guardian@example.com' })
  @IsEmail()
  guardianEmail: string;

  @ApiPropertyOptional({ enum: GuardianRelationshipDto })
  @IsOptional()
  @IsEnum(GuardianRelationshipDto)
  relationship?: GuardianRelationshipDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}

export class AcceptInvitationDto {
  @ApiProperty()
  @IsString()
  invitationToken: string;
}

export class GrantConsentDto {
  @ApiProperty()
  @IsString()
  minorId: string;

  @ApiProperty()
  @IsString()
  connectorType: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  scopes: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  dataCategories: string[];
}

export class RevokeConsentDto {
  @ApiProperty()
  @IsString()
  consentId: string;
}
