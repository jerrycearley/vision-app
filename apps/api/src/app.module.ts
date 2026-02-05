import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GuardiansModule } from './guardians/guardians.module';
import { ConnectorsModule } from './connectors/connectors.module';
import { GoalsModule } from './goals/goals.module';
import { RoadmapsModule } from './roadmaps/roadmaps.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AIModule } from './ai/ai.module';
import { TokensModule } from './tokens/tokens.module';
import { SponsorshipModule } from './sponsorship/sponsorship.module';
import { HealthModule } from './health/health.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import configuration from './config/configuration';
import { dataSourceOptions } from './database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => dataSourceOptions,
      inject: [ConfigService],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    GuardiansModule,
    ConnectorsModule,
    GoalsModule,
    RoadmapsModule,
    RecommendationsModule,
    AIModule,
    TokensModule,
    SponsorshipModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
