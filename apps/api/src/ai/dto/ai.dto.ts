import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RoadmapPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maxDuration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  preferFreeResources?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  learningStyle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pacePreference?: string;
}

export class GenerateRoadmapDto {
  @ApiProperty({ example: 'Become a full-stack developer' })
  @IsString()
  goal: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => RoadmapPreferencesDto)
  preferences?: RoadmapPreferencesDto;
}

export class GenerateRecommendationsDto {
  @ApiPropertyOptional({ example: 'career' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  count?: number;
}

export class RecommendationDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reasoning?: string;
}

export class ExplainRecommendationDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => RecommendationDto)
  recommendation: RecommendationDto;
}

export class ChatMessageDto {
  @ApiProperty()
  @IsString()
  role: string;

  @ApiProperty()
  @IsString()
  content: string;
}

export class ChatDto {
  @ApiProperty({ example: 'What career paths match my interests?' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: [ChatMessageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}
