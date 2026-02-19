import { Injectable } from '@nestjs/common';

export type AchievementCategory = 'education' | 'skill' | 'goal' | 'milestone' | 'reflection';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tokenReward: number;
}

@Injectable()
export class AchievementsService {
  /**
   * MVP: static definitions.
   * Later: these can become DB-backed + personalized.
   */
  listDefinitions(): AchievementDefinition[] {
    return [
      {
        id: 'edu-first-course-complete',
        title: 'Finish a course',
        description: 'Complete a full course you started (and record what you learned).',
        category: 'education',
        tokenReward: 50,
      },
      {
        id: 'skill-7day-streak',
        title: '7-day practice streak',
        description: 'Practice a real skill 7 days in a row (even 10 minutes counts).',
        category: 'skill',
        tokenReward: 25,
      },
      {
        id: 'goal-set-and-commit',
        title: 'Set a goal + first next step',
        description: 'Create a meaningful goal and commit to a concrete next step.',
        category: 'goal',
        tokenReward: 10,
      },
      {
        id: 'milestone-shipped',
        title: 'Ship a milestone',
        description: 'Complete a milestone that moves your roadmap forward.',
        category: 'milestone',
        tokenReward: 100,
      },
      {
        id: 'reflection-weekly',
        title: 'Weekly reflection',
        description: 'Write a short weekly reflection: what worked, what didn\'t, what you\'ll change.',
        category: 'reflection',
        tokenReward: 15,
      },
    ];
  }
}
