import { Controller, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { HealthService, HealthStatus, ReadinessStatus } from './health.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('healthz')
  @ApiOperation({ summary: 'Liveness probe - checks if the service is running' })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-02-05T12:00:00.000Z' },
        requestId: { type: 'string', example: 'abc123' },
      },
    },
  })
  getLiveness(@Req() req: Request): HealthStatus {
    const requestId = req.headers['x-request-id'] as string | undefined;
    return this.healthService.getLiveness(requestId);
  }

  @Get('readyz')
  @ApiOperation({
    summary: 'Readiness probe - checks if the service is ready to accept traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-02-05T12:00:00.000Z' },
        requestId: { type: 'string', example: 'abc123' },
        checks: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                responseTimeMs: { type: 'number', example: 5 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready',
  })
  async getReadiness(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const requestId = req.headers['x-request-id'] as string | undefined;
    const result = await this.healthService.getReadiness(requestId);

    const statusCode =
      result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json(result);
  }
}
