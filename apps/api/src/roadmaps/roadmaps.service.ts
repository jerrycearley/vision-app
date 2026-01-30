import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roadmap, RoadmapStatus } from './entities/roadmap.entity';
import { Milestone, MilestoneStatus } from './entities/milestone.entity';
import { Resource, ResourceType } from './entities/resource.entity';
import { Goal } from '../goals/entities/goal.entity';
import { AIService } from '../ai/ai.service';
import { TokensService } from '../tokens/tokens.service';
import { TokenReferenceType } from '../tokens/entities/token-ledger-entry.entity';

@Injectable()
export class RoadmapsService {
  constructor(
    @InjectRepository(Roadmap)
    private roadmapRepository: Repository<Roadmap>,
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    private aiService: AIService,
    private tokensService: TokensService,
  ) {}

  async generateFromGoal(userId: string, goalId: string, preferences?: any): Promise<Roadmap> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const aiResponse = await this.aiService.generateRoadmap(userId, goal.title, preferences);

    if (!aiResponse.success || !aiResponse.roadmap) {
      throw new BadRequestException('Failed to generate roadmap');
    }

    const { roadmap: generated } = aiResponse;

    // Create roadmap
    const roadmap = this.roadmapRepository.create({
      userId,
      goalId,
      title: generated.title,
      description: generated.description,
      estimatedDuration: generated.estimatedDuration,
      aiGenerated: true,
      aiModelUsed: aiResponse.provider,
      status: RoadmapStatus.DRAFT,
    });

    await this.roadmapRepository.save(roadmap);

    // Create milestones
    for (let i = 0; i < generated.milestones.length; i++) {
      const m = generated.milestones[i];
      const milestone = this.milestoneRepository.create({
        roadmapId: roadmap.id,
        title: m.title,
        description: m.description,
        order: i,
        status: MilestoneStatus.PENDING,
        estimatedDuration: m.estimatedDuration,
        skills: m.skills || [],
        tokenReward: this.calculateTokenReward(i, generated.milestones.length),
        verificationRequired: true,
      });

      await this.milestoneRepository.save(milestone);

      // Create resources
      for (const r of m.resources || []) {
        const resource = this.resourceRepository.create({
          milestoneId: milestone.id,
          type: this.mapResourceType(r.type),
          title: r.title,
          url: r.url,
          description: r.description,
          isFree: r.isFree,
        });
        await this.resourceRepository.save(resource);
      }
    }

    return this.findOne(userId, roadmap.id);
  }

  async findAll(userId: string): Promise<Roadmap[]> {
    return this.roadmapRepository.find({
      where: { userId },
      relations: ['milestones', 'goal'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, roadmapId: string): Promise<Roadmap> {
    const roadmap = await this.roadmapRepository.findOne({
      where: { id: roadmapId, userId },
      relations: ['milestones', 'milestones.resources', 'goal'],
    });

    if (!roadmap) {
      throw new NotFoundException('Roadmap not found');
    }

    // Sort milestones by order
    roadmap.milestones.sort((a, b) => a.order - b.order);

    return roadmap;
  }

  async updateRoadmapStatus(userId: string, roadmapId: string, status: RoadmapStatus): Promise<Roadmap> {
    const roadmap = await this.findOne(userId, roadmapId);
    roadmap.status = status;

    if (status === RoadmapStatus.ACTIVE && !roadmap.startDate) {
      roadmap.startDate = new Date();
    }

    if (status === RoadmapStatus.COMPLETED) {
      roadmap.completedAt = new Date();
    }

    await this.roadmapRepository.save(roadmap);
    return roadmap;
  }

  async completeMilestone(
    userId: string,
    roadmapId: string,
    milestoneId: string,
    isMinor: boolean,
  ): Promise<{ milestone: Milestone; tokenIssued?: boolean }> {
    const roadmap = await this.findOne(userId, roadmapId);
    const milestone = roadmap.milestones.find((m) => m.id === milestoneId);

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.status === MilestoneStatus.COMPLETED) {
      throw new BadRequestException('Milestone already completed');
    }

    milestone.status = MilestoneStatus.COMPLETED;
    milestone.completedAt = new Date();

    await this.milestoneRepository.save(milestone);

    // Issue token reward
    let tokenIssued = false;
    if (milestone.tokenReward && milestone.tokenReward > 0) {
      try {
        await this.tokensService.issueTokens({
          userId,
          amount: milestone.tokenReward,
          reason: TokenReferenceType.MILESTONE,
          referenceId: milestone.id,
          description: `Completed milestone: ${milestone.title}`,
          applyMinorLock: isMinor,
        });
        tokenIssued = true;
      } catch (error) {
        console.error('Failed to issue tokens:', error);
      }
    }

    // Check if all milestones are completed
    const allCompleted = roadmap.milestones.every(
      (m) => m.id === milestoneId || m.status === MilestoneStatus.COMPLETED || m.status === MilestoneStatus.SKIPPED,
    );

    if (allCompleted) {
      await this.updateRoadmapStatus(userId, roadmapId, RoadmapStatus.COMPLETED);
    }

    return { milestone, tokenIssued };
  }

  async updateMilestoneStatus(
    userId: string,
    roadmapId: string,
    milestoneId: string,
    status: MilestoneStatus,
  ): Promise<Milestone> {
    const roadmap = await this.findOne(userId, roadmapId);
    const milestone = roadmap.milestones.find((m) => m.id === milestoneId);

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    milestone.status = status;
    if (status === MilestoneStatus.IN_PROGRESS && roadmap.status === RoadmapStatus.DRAFT) {
      await this.updateRoadmapStatus(userId, roadmapId, RoadmapStatus.ACTIVE);
    }

    await this.milestoneRepository.save(milestone);
    return milestone;
  }

  async deleteRoadmap(userId: string, roadmapId: string): Promise<void> {
    const roadmap = await this.findOne(userId, roadmapId);
    await this.roadmapRepository.remove(roadmap);
  }

  private calculateTokenReward(milestoneIndex: number, totalMilestones: number): number {
    // Later milestones get more tokens
    const baseReward = 10;
    const progressBonus = Math.floor((milestoneIndex / totalMilestones) * 20);
    return baseReward + progressBonus;
  }

  private mapResourceType(type: string): ResourceType {
    const typeMap: Record<string, ResourceType> = {
      article: ResourceType.ARTICLE,
      video: ResourceType.VIDEO,
      course: ResourceType.COURSE,
      book: ResourceType.BOOK,
      tool: ResourceType.TOOL,
      community: ResourceType.COMMUNITY,
      mentor: ResourceType.MENTOR,
      event: ResourceType.EVENT,
    };
    return typeMap[type?.toLowerCase()] || ResourceType.OTHER;
  }
}
