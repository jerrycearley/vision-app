import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GuardiansController (e2e)', () => {
  let app: INestApplication;
  let minorToken: string;
  let guardianToken: string;
  let minorUserId: string;
  let guardianUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Create minor user
    const minorResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `minor-guardian-${Date.now()}@example.com`,
        password: 'password123',
        displayName: 'Minor Guardian Test',
        dateOfBirth: '2015-01-01',
      });
    minorToken = minorResponse.body.accessToken;
    minorUserId = minorResponse.body.user.id;

    // Create guardian user
    const guardianResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `guardian-${Date.now()}@example.com`,
        password: 'password123',
        displayName: 'Guardian Test',
        dateOfBirth: '1980-01-01',
      });
    guardianToken = guardianResponse.body.accessToken;
    guardianUserId = guardianResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Guardian Invitation', () => {
    it('should allow minors to invite guardians', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/guardians/invite')
        .set('Authorization', `Bearer ${minorToken}`)
        .send({
          guardianEmail: 'new-guardian@example.com',
          relationship: 'parent',
        })
        .expect(201);

      expect(response.body).toHaveProperty('invitationToken');
      expect(response.body).toHaveProperty('expiresAt');
    });
  });

  describe('Guardian Accept Invitation', () => {
    let invitationToken: string;

    beforeAll(async () => {
      // Create new invitation
      const inviteResponse = await request(app.getHttpServer())
        .post('/api/v1/guardians/invite')
        .set('Authorization', `Bearer ${minorToken}`)
        .send({
          guardianEmail: 'accept-test@example.com',
          relationship: 'parent',
        });
      invitationToken = inviteResponse.body.invitationToken;
    });

    it('should allow guardian to accept invitation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/guardians/accept')
        .set('Authorization', `Bearer ${guardianToken}`)
        .send({
          invitationToken,
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'active');
    });
  });

  describe('Guardian Lists', () => {
    it('should return guardians for minor', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/guardians/my-guardians')
        .set('Authorization', `Bearer ${minorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return minors for guardian', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/guardians/my-minors')
        .set('Authorization', `Bearer ${guardianToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Parental Consent Gating', () => {
    it('should track consent records', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/guardians/consent/${minorUserId}`)
        .set('Authorization', `Bearer ${guardianToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
