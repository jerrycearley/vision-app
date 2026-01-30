import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { MockAIProvider } from './providers/mock.provider';
import { UserProfile } from '../users/entities/user-profile.entity';
import { InterestSignal } from '../connectors/entities/interest-signal.entity';
import { Goal } from '../goals/entities/goal.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserProfile, InterestSignal, Goal]),
  ],
  controllers: [AIController],
  providers: [AIService, GeminiProvider, MockAIProvider],
  exports: [AIService],
})
export class AIModule {}
