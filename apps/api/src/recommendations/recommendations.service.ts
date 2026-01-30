import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation, RecommendationStatus, RecommendationType, RecommendationCategory, RecommendationSource } from './entities/recommendation.entity';
import { Favorite } from './entities/favorite.entity';
import { AIService } from '../ai/ai.service';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    private aiService: AIService,
  ) {}

  async generateRecommendations(userId: string, category?: string, count?: number): Promise<Recommendation[]> {
    const aiResponse = await this.aiService.generateRecommendations(userId, category, count);

    if (!aiResponse.success) {
      return [];
    }

    const recommendations: Recommendation[] = [];

    for (const rec of aiResponse.recommendations) {
      const recommendation = this.recommendationRepository.create({
        userId,
        type: rec.type as RecommendationType,
        category: rec.category as RecommendationCategory,
        title: rec.title,
        description: rec.description,
        relevanceScore: rec.relevanceScore,
        reasoning: rec.reasoning,
        source: RecommendationSource.AI_GENERATED,
        status: RecommendationStatus.ACTIVE,
      });

      await this.recommendationRepository.save(recommendation);
      recommendations.push(recommendation);
    }

    return recommendations;
  }

  async findAll(
    userId: string,
    options: { category?: string; type?: string; status?: string; limit?: number; offset?: number } = {},
  ): Promise<{ recommendations: Recommendation[]; total: number }> {
    const query = this.recommendationRepository
      .createQueryBuilder('rec')
      .where('rec.userId = :userId', { userId })
      .orderBy('rec.relevanceScore', 'DESC')
      .addOrderBy('rec.createdAt', 'DESC');

    if (options.category) {
      query.andWhere('rec.category = :category', { category: options.category });
    }

    if (options.type) {
      query.andWhere('rec.type = :type', { type: options.type });
    }

    if (options.status) {
      query.andWhere('rec.status = :status', { status: options.status });
    }

    const total = await query.getCount();

    if (options.limit) {
      query.take(options.limit);
    }

    if (options.offset) {
      query.skip(options.offset);
    }

    const recommendations = await query.getMany();

    return { recommendations, total };
  }

  async findOne(userId: string, recommendationId: string): Promise<Recommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id: recommendationId, userId },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }

    // Mark as viewed
    if (recommendation.status === RecommendationStatus.ACTIVE) {
      recommendation.status = RecommendationStatus.VIEWED;
      await this.recommendationRepository.save(recommendation);
    }

    return recommendation;
  }

  async saveToFavorites(userId: string, recommendationId: string, notes?: string, tags?: string[]): Promise<Favorite> {
    const recommendation = await this.findOne(userId, recommendationId);

    // Check if already favorited
    const existing = await this.favoriteRepository.findOne({
      where: { userId, recommendationId },
    });

    if (existing) {
      existing.notes = notes || existing.notes;
      existing.tags = tags || existing.tags;
      return this.favoriteRepository.save(existing);
    }

    const favorite = this.favoriteRepository.create({
      userId,
      recommendationId,
      notes,
      tags: tags || [],
    });

    // Update recommendation status
    recommendation.status = RecommendationStatus.SAVED;
    await this.recommendationRepository.save(recommendation);

    return this.favoriteRepository.save(favorite);
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { userId },
      relations: ['recommendation'],
      order: { createdAt: 'DESC' },
    });
  }

  async removeFavorite(userId: string, favoriteId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id: favoriteId, userId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
  }

  async submitFeedback(
    userId: string,
    recommendationId: string,
    feedback: { rating?: number; liked?: boolean; notes?: string },
  ): Promise<Recommendation> {
    const recommendation = await this.findOne(userId, recommendationId);

    recommendation.userFeedback = {
      ...recommendation.userFeedback,
      ...feedback,
      givenAt: new Date(),
    };

    return this.recommendationRepository.save(recommendation);
  }

  async dismissRecommendation(userId: string, recommendationId: string): Promise<Recommendation> {
    const recommendation = await this.findOne(userId, recommendationId);
    recommendation.status = RecommendationStatus.DISMISSED;
    return this.recommendationRepository.save(recommendation);
  }
}
