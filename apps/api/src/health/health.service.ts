import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  requestId?: string;
}

export interface ReadinessStatus extends HealthStatus {
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTimeMs?: number;
      error?: string;
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private static readonly DB_TIMEOUT_MS = 3000;
  private static readonly READINESS_CACHE_MS = 1000;

  private lastReadiness?: { at: number; value: ReadinessStatus };

  constructor(private readonly dataSource: DataSource) {}

  getLiveness(requestId?: string): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    };
  }

  async getReadiness(requestId?: string): Promise<ReadinessStatus> {
    const now = Date.now();
    if (
      this.lastReadiness &&
      now - this.lastReadiness.at < HealthService.READINESS_CACHE_MS
    ) {
      // Keep the cached checks, but refresh requestId/timestamp for easier tracing.
      return {
        ...this.lastReadiness.value,
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId }),
      };
    }

    const dbCheck = await this.checkDatabase();

    const overallStatus = dbCheck.status === 'ok' ? 'ok' : 'error';

    const result: ReadinessStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
      checks: {
        database: dbCheck,
      },
    };

    this.lastReadiness = { at: now, value: result };

    if (overallStatus !== 'ok') {
      this.logger.warn(`Readiness check failed: ${JSON.stringify(result)}`);
    }

    return result;
  }

  private async checkDatabase(): Promise<ReadinessStatus['checks']['database']> {
    const startTime = Date.now();

    try {
      // Use a promise race to enforce timeout
      const queryPromise = this.dataSource.query('SELECT 1');
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('Database query timeout')),
          HealthService.DB_TIMEOUT_MS,
        );
      });

      await Promise.race([queryPromise, timeoutPromise]);

      const responseTimeMs = Date.now() - startTime;
      return {
        status: 'ok',
        responseTimeMs,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      this.logger.error(
        `Database health check failed after ${responseTimeMs}ms: ${error.message}`,
      );
      return {
        status: 'error',
        responseTimeMs,
        error: error.message,
      };
    }
  }
}
