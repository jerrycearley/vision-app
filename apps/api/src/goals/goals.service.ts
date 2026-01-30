import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal, GoalStatus } from './entities/goal.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
  ) {}

  async create(userId: string, data: Partial<Goal>): Promise<Goal> {
    const goal = this.goalRepository.create({
      ...data,
      userId,
      status: GoalStatus.DRAFT,
    });
    return this.goalRepository.save(goal);
  }

  async findAll(userId: string, status?: GoalStatus): Promise<Goal[]> {
    const query = this.goalRepository.createQueryBuilder('goal')
      .where('goal.userId = :userId', { userId })
      .orderBy('goal.priority', 'DESC')
      .addOrderBy('goal.createdAt', 'DESC');

    if (status) {
      query.andWhere('goal.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(userId: string, goalId: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, userId },
      relations: ['roadmaps'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  async update(userId: string, goalId: string, data: Partial<Goal>): Promise<Goal> {
    const goal = await this.findOne(userId, goalId);
    Object.assign(goal, data);
    return this.goalRepository.save(goal);
  }

  async delete(userId: string, goalId: string): Promise<void> {
    const goal = await this.findOne(userId, goalId);
    await this.goalRepository.remove(goal);
  }

  async updateStatus(userId: string, goalId: string, status: GoalStatus): Promise<Goal> {
    return this.update(userId, goalId, { status });
  }
}
