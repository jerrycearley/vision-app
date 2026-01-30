import { Injectable } from '@nestjs/common';
import {
  RoadmapGenerationRequest,
  RoadmapGenerationResponse,
  RecommendationGenerationRequest,
  RecommendationGenerationResponse,
  ExplanationRequest,
  ExplanationResponse,
  GeneratedRoadmap,
  GeneratedRecommendation,
} from '@vision/shared';

@Injectable()
export class MockAIProvider {
  async generateRoadmap(request: RoadmapGenerationRequest): Promise<RoadmapGenerationResponse> {
    // Deterministic mock response based on goal
    const roadmap = this.createMockRoadmap(request.goal, request.userProfile);

    return {
      success: true,
      roadmap,
      provider: 'mock',
    };
  }

  async generateRecommendations(
    request: RecommendationGenerationRequest,
  ): Promise<RecommendationGenerationResponse> {
    const recommendations = this.createMockRecommendations(
      request.userProfile,
      request.category,
      request.count || 5,
    );

    return {
      success: true,
      recommendations,
      provider: 'mock',
    };
  }

  async explainRecommendation(request: ExplanationRequest): Promise<ExplanationResponse> {
    const explanation = this.createMockExplanation(request);

    return {
      success: true,
      explanation,
      relatedInterests: request.userProfile.interests.slice(0, 3),
      provider: 'mock',
    };
  }

  private createMockRoadmap(goal: string, profile: any): GeneratedRoadmap {
    const goalLower = goal.toLowerCase();

    // Programming/Tech goals
    if (goalLower.includes('programming') || goalLower.includes('coding') || goalLower.includes('developer')) {
      return {
        title: `Become a ${goal}`,
        description: `A comprehensive roadmap to achieve your goal of becoming proficient in programming and software development.`,
        estimatedDuration: '6 months',
        milestones: [
          {
            title: 'Foundation: Learn Programming Basics',
            description: 'Master the fundamentals of programming including variables, loops, functions, and data structures.',
            estimatedDuration: '4 weeks',
            resources: [
              {
                title: 'freeCodeCamp - JavaScript Basics',
                type: 'course',
                url: 'https://freecodecamp.org',
                description: 'Free comprehensive programming course',
                isFree: true,
              },
              {
                title: 'The Odin Project',
                type: 'course',
                url: 'https://theodinproject.com',
                description: 'Full stack curriculum',
                isFree: true,
              },
            ],
            skills: ['JavaScript', 'Problem Solving', 'Debugging'],
            verificationSuggestion: 'Complete all exercises and build a simple calculator app',
          },
          {
            title: 'Build Your First Project',
            description: 'Apply your knowledge by building a real-world project.',
            estimatedDuration: '3 weeks',
            resources: [
              {
                title: 'GitHub',
                type: 'tool',
                url: 'https://github.com',
                description: 'Version control and project hosting',
                isFree: true,
              },
            ],
            skills: ['Git', 'Project Structure', 'Code Organization'],
            verificationSuggestion: 'Deploy your project and share the GitHub link',
          },
          {
            title: 'Learn a Framework',
            description: 'Master a popular framework to build modern applications.',
            estimatedDuration: '6 weeks',
            resources: [
              {
                title: 'React Documentation',
                type: 'article',
                url: 'https://react.dev',
                description: 'Official React learning resources',
                isFree: true,
              },
            ],
            skills: ['React', 'Component-Based Design', 'State Management'],
            verificationSuggestion: 'Build a full-featured application using the framework',
          },
          {
            title: 'Portfolio and Job Prep',
            description: 'Prepare your portfolio and practice for interviews.',
            estimatedDuration: '4 weeks',
            resources: [
              {
                title: 'LeetCode',
                type: 'tool',
                url: 'https://leetcode.com',
                description: 'Practice coding interview questions',
                isFree: true,
              },
            ],
            skills: ['Interview Skills', 'Portfolio Design', 'Networking'],
            verificationSuggestion: 'Complete 50 coding challenges and finalize portfolio',
          },
        ],
        prerequisites: ['Basic computer skills', 'Dedication to learning'],
        tips: [
          'Code every day, even if just for 30 minutes',
          'Join online communities like Discord servers',
          'Build projects that interest you personally',
        ],
      };
    }

    // Default generic roadmap
    return {
      title: `Path to: ${goal}`,
      description: `A structured approach to achieving your goal: ${goal}`,
      estimatedDuration: '3-6 months',
      milestones: [
        {
          title: 'Research and Planning',
          description: 'Understand what it takes to achieve this goal and create a detailed plan.',
          estimatedDuration: '1 week',
          resources: [
            {
              title: 'Goal Setting Guide',
              type: 'article',
              description: 'Learn effective goal setting strategies',
              isFree: true,
            },
          ],
          skills: ['Research', 'Planning', 'Goal Setting'],
          verificationSuggestion: 'Create a detailed written plan',
        },
        {
          title: 'Skill Building Phase 1',
          description: 'Develop foundational skills needed for your goal.',
          estimatedDuration: '4 weeks',
          resources: [
            {
              title: 'Online Learning Platform',
              type: 'course',
              description: 'Find relevant courses on platforms like Coursera or Udemy',
              isFree: false,
            },
          ],
          skills: ['Core Skills', 'Self-discipline', 'Time Management'],
          verificationSuggestion: 'Complete foundational courses and assessments',
        },
        {
          title: 'Practical Application',
          description: 'Apply what you have learned in real-world situations.',
          estimatedDuration: '6 weeks',
          resources: [
            {
              title: 'Practice Projects',
              type: 'tool',
              description: 'Hands-on practice opportunities',
              isFree: true,
            },
          ],
          skills: ['Application', 'Problem Solving', 'Adaptation'],
          verificationSuggestion: 'Complete at least 3 practical projects',
        },
        {
          title: 'Refinement and Mastery',
          description: 'Refine your skills and work towards mastery.',
          estimatedDuration: '4 weeks',
          resources: [
            {
              title: 'Advanced Resources',
              type: 'course',
              description: 'Advanced learning materials',
              isFree: false,
            },
          ],
          skills: ['Advanced Techniques', 'Expertise', 'Mentorship'],
          verificationSuggestion: 'Demonstrate expertise through a capstone project',
        },
      ],
      prerequisites: ['Commitment', 'Basic relevant knowledge'],
      tips: [
        'Stay consistent with your practice',
        'Find a mentor or community',
        'Track your progress regularly',
        'Celebrate small wins along the way',
      ],
    };
  }

  private createMockRecommendations(
    profile: any,
    category?: string,
    count: number = 5,
  ): GeneratedRecommendation[] {
    const recommendations: GeneratedRecommendation[] = [];

    const baseRecommendations: GeneratedRecommendation[] = [
      {
        type: 'course',
        category: 'education',
        title: 'Introduction to Data Science',
        description: 'Learn the fundamentals of data science including Python, statistics, and machine learning basics.',
        relevanceScore: 0.9,
        reasoning: 'Based on your interest in technology and analytical skills',
        tags: ['data-science', 'python', 'analytics'],
      },
      {
        type: 'activity',
        category: 'hobby',
        title: 'Local Photography Club Meetup',
        description: 'Join a community of photography enthusiasts for weekly photo walks and critique sessions.',
        relevanceScore: 0.85,
        reasoning: 'Matches your creative interests and desire for social activities',
        tags: ['photography', 'social', 'creative'],
      },
      {
        type: 'event',
        category: 'career',
        title: 'Tech Career Fair 2024',
        description: 'Connect with leading tech companies and explore career opportunities in your area.',
        relevanceScore: 0.88,
        reasoning: 'Aligns with your career development goals',
        tags: ['career', 'networking', 'technology'],
      },
      {
        type: 'community',
        category: 'social',
        title: 'Young Professionals Network',
        description: 'A community of young professionals sharing experiences and supporting career growth.',
        relevanceScore: 0.82,
        reasoning: 'Great for building professional connections in your field',
        tags: ['networking', 'professional', 'community'],
      },
      {
        type: 'course',
        category: 'skill_building',
        title: 'Public Speaking Mastery',
        description: 'Develop confidence and skills in public speaking through practical exercises.',
        relevanceScore: 0.78,
        reasoning: 'Essential skill for career advancement based on your goals',
        tags: ['communication', 'leadership', 'skills'],
      },
      {
        type: 'opportunity',
        category: 'volunteer',
        title: 'Code Mentorship Program',
        description: 'Mentor young students in coding and help shape the next generation of developers.',
        relevanceScore: 0.75,
        reasoning: 'Combines your skills with giving back to the community',
        tags: ['mentorship', 'coding', 'volunteer'],
      },
      {
        type: 'content',
        category: 'entertainment',
        title: 'TED Talks: Innovation Series',
        description: 'Curated collection of inspiring talks about innovation and creativity.',
        relevanceScore: 0.72,
        reasoning: 'Engaging content aligned with your interests in innovation',
        tags: ['inspiration', 'innovation', 'learning'],
      },
    ];

    // Filter by category if specified
    let filtered = category
      ? baseRecommendations.filter((r) => r.category === category)
      : baseRecommendations;

    // If filtering results in too few, use all
    if (filtered.length < count) {
      filtered = baseRecommendations;
    }

    // Personalize based on profile interests
    if (profile.interests && profile.interests.length > 0) {
      filtered = filtered.map((r) => ({
        ...r,
        reasoning: `${r.reasoning}. This connects with your interest in ${profile.interests[0]}.`,
      }));
    }

    return filtered.slice(0, count);
  }

  private createMockExplanation(request: ExplanationRequest): string {
    const { recommendation, userProfile } = request;

    const interests = userProfile.interests.join(', ') || 'your expressed interests';
    const goals = userProfile.goals.join(' and ') || 'your personal goals';

    return `We recommended "${recommendation.title}" specifically for you because it aligns perfectly with ${interests}.

This ${recommendation.category} opportunity stood out in our analysis because it directly supports ${goals}. Based on your profile, we believe this could be a valuable next step in your journey.

${recommendation.description}

To get started, we suggest exploring this recommendation further and considering how it fits into your current schedule. Many users with similar interests have found this to be a rewarding experience. If you'd like, we can also suggest complementary activities or resources that would enhance this experience.`;
  }
}
