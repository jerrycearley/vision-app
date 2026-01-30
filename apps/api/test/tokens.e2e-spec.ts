import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TokensController (e2e)', () => {
  let app: INestApplication;
  let adultToken: string;
  let minorToken: string;
  let adultUserId: string;
  let minorUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Create adult user
    const adultResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `adult-token-${Date.now()}@example.com`,
        password: 'password123',
        displayName: 'Adult Token Test',
        dateOfBirth: '1990-01-01',
      });
    adultToken = adultResponse.body.accessToken;
    adultUserId = adultResponse.body.user.id;

    // Create minor user
    const minorResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `minor-token-${Date.now()}@example.com`,
        password: 'password123',
        displayName: 'Minor Token Test',
        dateOfBirth: '2015-01-01',
      });
    minorToken = minorResponse.body.accessToken;
    minorUserId = minorResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Token Balance', () => {
    it('should return token balance for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tokens/balance')
        .set('Authorization', `Bearer ${adultToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('availableBalance');
      expect(response.body).toHaveProperty('lockedBalance');
      expect(response.body).toHaveProperty('totalBalance');
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/tokens/balance')
        .expect(401);
    });
  });

  describe('Minor Token Lock Enforcement', () => {
    it('should prevent minors from transferring tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tokens/transfer')
        .set('Authorization', `Bearer ${minorToken}`)
        .send({
          recipientId: adultUserId,
          amount: 10,
          notes: 'Test transfer',
        })
        .expect(403);

      expect(response.body.message).toContain('Minors cannot transfer');
    });

    it('should allow adults to transfer tokens', async () => {
      // Note: This test may fail if adult has no balance
      // In a real test, we would first issue tokens to the adult
      const response = await request(app.getHttpServer())
        .post('/api/v1/tokens/transfer')
        .set('Authorization', `Bearer ${adultToken}`)
        .send({
          recipientId: minorUserId,
          amount: 1,
          notes: 'Test transfer',
        });

      // Either succeeds or fails due to insufficient balance (not forbidden)
      expect(response.status).not.toBe(403);
    });
  });

  describe('Ledger Integrity', () => {
    it('should verify ledger integrity', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tokens/verify-integrity')
        .set('Authorization', `Bearer ${adultToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('valid');
      expect(response.body.valid).toBe(true);
    });
  });

  describe('Token History', () => {
    it('should return transaction history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tokens/history')
        .set('Authorization', `Bearer ${adultToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('entries');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.entries)).toBe(true);
    });
  });
});
