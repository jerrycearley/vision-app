import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate new recommendations' })
  @ApiResponse({ status: 201, description: 'Recommendations generated' })
  async generate(@Request() req, @Body() body: { category?: string; count?: number }) {
    return this.recommendationsService.generateRecommendations(
      req.user.userId,
      body.category,
      body.count,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all recommendations' })
  @ApiResponse({ status: 200, description: 'List of recommendations' })
  async findAll(
    @Request() req,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.recommendationsService.findAll(req.user.userId, { category, type, status, limit, offset });
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get saved favorites' })
  @ApiResponse({ status: 200, description: 'List of favorites' })
  async getFavorites(@Request() req) {
    return this.recommendationsService.getFavorites(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recommendation by ID' })
  @ApiResponse({ status: 200, description: 'Recommendation found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.recommendationsService.findOne(req.user.userId, id);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Save recommendation to favorites' })
  @ApiResponse({ status: 201, description: 'Added to favorites' })
  async saveToFavorites(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { notes?: string; tags?: string[] },
  ) {
    return this.recommendationsService.saveToFavorites(req.user.userId, id, body.notes, body.tags);
  }

  @Delete('favorites/:id')
  @ApiOperation({ summary: 'Remove from favorites' })
  @ApiResponse({ status: 200, description: 'Removed from favorites' })
  async removeFavorite(@Request() req, @Param('id') id: string) {
    await this.recommendationsService.removeFavorite(req.user.userId, id);
    return { success: true };
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit feedback for a recommendation' })
  @ApiResponse({ status: 200, description: 'Feedback submitted' })
  async submitFeedback(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { rating?: number; liked?: boolean; notes?: string },
  ) {
    return this.recommendationsService.submitFeedback(req.user.userId, id, body);
  }

  @Post(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss a recommendation' })
  @ApiResponse({ status: 200, description: 'Recommendation dismissed' })
  async dismiss(@Request() req, @Param('id') id: string) {
    return this.recommendationsService.dismissRecommendation(req.user.userId, id);
  }
}
