import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoadmapsController } from './roadmaps.controller';
import { RoadmapsService } from './roadmaps.service';
import { Roadmap } from './entities/roadmap.entity';
import { Milestone } from './entities/milestone.entity';
import { Resource } from './entities/resource.entity';
import { Goal } from '../goals/entities/goal.entity';
import { AIModule } from '../ai/ai.module';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Roadmap, Milestone, Resource, Goal]),
    AIModule,
    TokensModule,
  ],
  controllers: [RoadmapsController],
  providers: [RoadmapsService],
  exports: [RoadmapsService],
})
export class RoadmapsModule {}
