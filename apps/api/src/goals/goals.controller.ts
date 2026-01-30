import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoalStatus } from './entities/goal.entity';

@ApiTags('goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({ status: 201, description: 'Goal created' })
  async create(@Request() req, @Body() data: any) {
    return this.goalsService.create(req.user.userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals' })
  @ApiResponse({ status: 200, description: 'List of goals' })
  async findAll(@Request() req, @Query('status') status?: GoalStatus) {
    return this.goalsService.findAll(req.user.userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by ID' })
  @ApiResponse({ status: 200, description: 'Goal found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.goalsService.findOne(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update goal' })
  @ApiResponse({ status: 200, description: 'Goal updated' })
  async update(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.goalsService.update(req.user.userId, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goal' })
  @ApiResponse({ status: 200, description: 'Goal deleted' })
  async delete(@Request() req, @Param('id') id: string) {
    await this.goalsService.delete(req.user.userId, id);
    return { success: true };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update goal status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(@Request() req, @Param('id') id: string, @Body('status') status: GoalStatus) {
    return this.goalsService.updateStatus(req.user.userId, id, status);
  }
}
