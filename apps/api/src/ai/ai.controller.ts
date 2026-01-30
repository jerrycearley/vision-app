import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateRoadmapDto, GenerateRecommendationsDto, ExplainRecommendationDto, ChatDto } from './dto/ai.dto';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('roadmap')
  @ApiOperation({ summary: 'Generate a roadmap for a goal' })
  @ApiResponse({ status: 200, description: 'Generated roadmap' })
  async generateRoadmap(@Request() req, @Body() dto: GenerateRoadmapDto) {
    return this.aiService.generateRoadmap(
      req.user.userId,
      dto.goal,
      dto.preferences,
    );
  }

  @Post('recommendations')
  @ApiOperation({ summary: 'Generate personalized recommendations' })
  @ApiResponse({ status: 200, description: 'Generated recommendations' })
  async generateRecommendations(@Request() req, @Body() dto: GenerateRecommendationsDto) {
    return this.aiService.generateRecommendations(
      req.user.userId,
      dto.category,
      dto.count,
    );
  }

  @Post('explain')
  @ApiOperation({ summary: 'Explain why a recommendation is relevant' })
  @ApiResponse({ status: 200, description: 'Explanation' })
  async explainRecommendation(@Request() req, @Body() dto: ExplainRecommendationDto) {
    return this.aiService.explainRecommendation(req.user.userId, dto.recommendation);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with the AI assistant' })
  @ApiResponse({ status: 200, description: 'AI response' })
  async chat(@Request() req, @Body() dto: ChatDto) {
    const response = await this.aiService.chat(
      req.user.userId,
      dto.message,
      dto.history,
    );
    return { response };
  }

  @Get('infer-interests')
  @ApiOperation({ summary: 'Infer interests from connected data sources' })
  @ApiResponse({ status: 200, description: 'Inferred interests' })
  async inferInterests(@Request() req) {
    return this.aiService.inferInterests(req.user.userId);
  }
}
