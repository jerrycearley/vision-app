import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AchievementsService, AchievementDefinition } from './achievements.service';

@ApiTags('achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'List achievement definitions (MVP)' })
  @ApiResponse({ status: 200, description: 'Achievement definitions' })
  list(): AchievementDefinition[] {
    return this.achievementsService.listDefinitions();
  }
}
