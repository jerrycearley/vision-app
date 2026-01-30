import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class InitiateOAuthDto {
  @ApiProperty({ example: 'google' })
  @IsString()
  connectorType: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  scopes: string[];
}

export class OAuthCallbackDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  state: string;
}

export class UploadImportDto {
  @ApiProperty({ enum: ['csv', 'json', 'text'] })
  @IsEnum(['csv', 'json', 'text'])
  fileType: 'csv' | 'json' | 'text';

  @ApiProperty()
  @IsString()
  fileName: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ example: 'interests' })
  @IsString()
  dataCategory: string;
}

export class GetSignalsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  offset?: number;
}
