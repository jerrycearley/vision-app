import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GeminiProvider } from './providers/gemini.provider';
import { MockAIProvider } from './providers/mock.provider';
import { UserProfile } from '../users/entities/user-profile.entity';
import { InterestSignal } from '../connectors/entities/interest-signal.entity';
import { Goal } from '../goals/entities/goal.entity';
import {
  RoadmapGenerationRequest,
  RoadmapGenerationResponse,
  RecommendationGenerationRequest,
  RecommendationGenerationResponse,
  ExplanationRequest,
  ExplanationResponse,
  UserProfileContext,
} from '@vision/shared';

@Injectable()
export class AIService {
  constructor(
    private geminiProvider: GeminiProvider,
    private mockProvider: MockAIProvider,
    private configService: ConfigService,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(InterestSignal)
    private signalRepository: Repository<InterestSignal>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
  ) {}

  private shouldUseMock(): boolean {
    // Use mock if Gemini is not available or AI is disabled
    return !this.geminiProvider.isAvailable() ||
           this.configService.get<boolean>('features.aiEnabled') === false;
  }

  async generateRoadmap(
    userId: string,
    goal: string,
    preferences?: any,
  ): Promise<RoadmapGenerationResponse> {
    const userProfile = await this.buildUserProfileContext(userId);

    const request: RoadmapGenerationRequest = {
      goal,
      userProfile,
      preferences,
    };

    if (this.shouldUseMock()) {
      return this.mockProvider.generateRoadmap(request);
    }

    try {
      const result = await this.geminiProvider.generateRoadmap(request);
      if (!result.success) {
        // Fallback to mock on error
        return this.mockProvider.generateRoadmap(request);
      }
      return result;
    } catch (error) {
      return this.mockProvider.generateRoadmap(request);
    }
  }

  async generateRecommendations(
    userId: string,
    category?: string,
    count?: number,
  ): Promise<RecommendationGenerationResponse> {
    const userProfile = await this.buildUserProfileContext(userId);

    const request: RecommendationGenerationRequest = {
      userProfile,
      category,
      count,
    };

    if (this.shouldUseMock()) {
      return this.mockProvider.generateRecommendations(request);
    }

    try {
      const result = await this.geminiProvider.generateRecommendations(request);
      if (!result.success) {
        return this.mockProvider.generateRecommendations(request);
      }
      return result;
    } catch (error) {
      return this.mockProvider.generateRecommendations(request);
    }
  }

  async explainRecommendation(
    userId: string,
    recommendation: {
      id: string;
      title: string;
      description: string;
      category: string;
      reasoning?: string;
    },
  ): Promise<ExplanationResponse> {
    const userProfile = await this.buildUserProfileContext(userId);

    const request: ExplanationRequest = {
      recommendation,
      userProfile,
    };

    if (this.shouldUseMock()) {
      return this.mockProvider.explainRecommendation(request);
    }

    try {
      const result = await this.geminiProvider.explainRecommendation(request);
      if (!result.success) {
        return this.mockProvider.explainRecommendation(request);
      }
      return result;
    } catch (error) {
      return this.mockProvider.explainRecommendation(request);
    }
  }

  async chat(userId: string, message: string, history: any[] = []): Promise<string> {
    const userProfile = await this.buildUserProfileContext(userId);

    // For chat, we'll use a simpler approach
    // In production, this would maintain conversation context
    const response = `I understand you're asking about: "${message}".

Based on your profile, you're interested in ${userProfile.interests.slice(0, 3).join(', ')}.

How can I help you explore these interests further or work towards your goals of ${userProfile.goals.slice(0, 2).join(' and ')}?

You can ask me to:
- Generate a roadmap for a specific goal
- Get personalized recommendations
- Explain why something is recommended for you
- Help you explore new interests`;

    return response;
  }

  async inferInterests(userId: string): Promise<{
    inferred: string[];
    confidence: number;
    sources: string[];
  }> {
    // Get signals from all sources
    const signals = await this.signalRepository.find({
      where: { userId },
      order: { weight: 'DESC' },
      take: 100,
    });

    // Aggregate and analyze
    const topicCounts: Record<string, { count: number; totalWeight: number; sources: Set<string> }> = {};

    for (const signal of signals) {
      if (!topicCounts[signal.topic]) {
        topicCounts[signal.topic] = { count: 0, totalWeight: 0, sources: new Set() };
      }
      topicCounts[signal.topic].count += 1;
      topicCounts[signal.topic].totalWeight += signal.weight * signal.confidence;
      topicCounts[signal.topic].sources.add(signal.source);
    }

    // Sort by weighted score
    const sorted = Object.entries(topicCounts)
      .map(([topic, data]) => ({
        topic,
        score: data.totalWeight / data.count,
        sources: Array.from(data.sources),
      }))
      .sort((a, b) => b.score - a.score);

    const inferred = sorted.slice(0, 10).map((s) => s.topic);
    const allSources = [...new Set(sorted.flatMap((s) => s.sources))];

    return {
      inferred,
      confidence: signals.length > 10 ? 0.8 : 0.5,
      sources: allSources,
    };
  }

  private async buildUserProfileContext(userId: string): Promise<UserProfileContext> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    const goals = await this.goalRepository.find({
      where: { userId },
      take: 5,
      order: { priority: 'DESC' },
    });

    const signals = await this.signalRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: 20,
    });

    // Combine profile interests with signal-derived interests
    const signalInterests = [...new Set(signals.map((s) => s.topic))];
    const allInterests = [...new Set([
      ...(profile?.interests || []),
      ...(profile?.hobbies || []),
      ...signalInterests,
    ])];

    return {
      interests: allInterests,
      skills: profile?.skills || [],
      goals: goals.map((g) => g.title),
      educationLevel: profile?.educationLevel,
      recentActivities: signals.slice(0, 5).map((s) => s.topic),
    };
  }
}
