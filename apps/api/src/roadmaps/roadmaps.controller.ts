import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoadmapsService } from './roadmaps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoadmapStatus } from './entities/roadmap.entity';
import { MilestoneStatus } from './entities/milestone.entity';

@ApiTags('roadmaps')
@Controller('roadmaps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a roadmap from a goal' })
  @ApiResponse({ status: 201, description: 'Roadmap generated' })
  async generate(@Request() req, @Body() body: { goalId: string; preferences?: any }) {
    return this.roadmapsService.generateFromGoal(req.user.userId, body.goalId, body.preferences);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roadmaps' })
  @ApiResponse({ status: 200, description: 'List of roadmaps' })
  async findAll(@Request() req) {
    return this.roadmapsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get roadmap by ID' })
  @ApiResponse({ status: 200, description: 'Roadmap found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.roadmapsService.findOne(req.user.userId, id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update roadmap status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(@Request() req, @Param('id') id: string, @Body('status') status: RoadmapStatus) {
    return this.roadmapsService.updateRoadmapStatus(req.user.userId, id, status);
  }

  @Post(':id/milestones/:milestoneId/complete')
  @ApiOperation({ summary: 'Complete a milestone' })
  @ApiResponse({ status: 200, description: 'Milestone completed' })
  async completeMilestone(
    @Request() req,
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.roadmapsService.completeMilestone(
      req.user.userId,
      id,
      milestoneId,
      req.user.isMinor,
    );
  }

  @Put(':id/milestones/:milestoneId/status')
  @ApiOperation({ summary: 'Update milestone status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateMilestoneStatus(
    @Request() req,
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body('status') status: MilestoneStatus,
  ) {
    return this.roadmapsService.updateMilestoneStatus(req.user.userId, id, milestoneId, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete roadmap' })
  @ApiResponse({ status: 200, description: 'Roadmap deleted' })
  async delete(@Request() req, @Param('id') id: string) {
    await this.roadmapsService.deleteRoadmap(req.user.userId, id);
    return { success: true };
  }
}
