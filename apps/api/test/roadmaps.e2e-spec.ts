import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('RoadmapsController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;
  let goalId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Create test user
    const userResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `roadmap-${Date.now()}@example.com`,
        password: 'password123',
        displayName: 'Roadmap Test',
        dateOfBirth: '1990-01-01',
      });
    userToken = userResponse.body.accessToken;
    userId = userResponse.body.user.id;

    // Create a goal
    const goalResponse = await request(app.getHttpServer())
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Learn Programming',
        description: 'Master software development',
        category: 'skill',
      });
    goalId = goalResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Roadmap Generation', () => {
    it('should generate a roadmap from a goal', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/roadmaps/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          goalId,
          preferences: {
            preferFreeResources: true,
          },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('milestones');
      expect(response.body.aiGenerated).toBe(true);
      expect(Array.isArray(response.body.milestones)).toBe(true);
    });
  });

  describe('Milestone Completion', () => {
    let roadmapId: string;
    let milestoneId: string;

    beforeAll(async () => {
      // Generate a roadmap
      const roadmapResponse = await request(app.getHttpServer())
        .post('/api/v1/roadmaps/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ goalId });

      roadmapId = roadmapResponse.body.id;
      milestoneId = roadmapResponse.body.milestones[0]?.id;
    });

    it('should complete a milestone and issue tokens', async () => {
      if (!milestoneId) {
        console.log('No milestone to test');
        return;
      }

      // Get initial token balance
      const initialBalance = await request(app.getHttpServer())
        .get('/api/v1/tokens/balance')
        .set('Authorization', `Bearer ${userToken}`);

      // Complete milestone
      const response = await request(app.getHttpServer())
        .post(`/api/v1/roadmaps/${roadmapId}/milestones/${milestoneId}/complete`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('milestone');
      expect(response.body.milestone.status).toBe('completed');

      // Verify tokens were issued
      if (response.body.tokenIssued) {
        const newBalance = await request(app.getHttpServer())
          .get('/api/v1/tokens/balance')
          .set('Authorization', `Bearer ${userToken}`);

        const initialTotal = Number(initialBalance.body.availableBalance) + Number(initialBalance.body.lockedBalance);
        const newTotal = Number(newBalance.body.availableBalance) + Number(newBalance.body.lockedBalance);

        expect(newTotal).toBeGreaterThan(initialTotal);
      }
    });

    it('should prevent completing already completed milestone', async () => {
      if (!milestoneId) return;

      await request(app.getHttpServer())
        .post(`/api/v1/roadmaps/${roadmapId}/milestones/${milestoneId}/complete`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });
  });

  describe('Roadmap Status', () => {
    let roadmapId: string;

    beforeAll(async () => {
      const roadmapResponse = await request(app.getHttpServer())
        .post('/api/v1/roadmaps/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ goalId });
      roadmapId = roadmapResponse.body.id;
    });

    it('should update roadmap status', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/roadmaps/${roadmapId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'active' })
        .expect(200);

      expect(response.body.status).toBe('active');
    });
  });
});
