import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // API prefix (health endpoints at root, others at /api/v1)
  app.setGlobalPrefix('api/v1', {
    exclude: ['healthz', 'readyz'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Vision API')
    .setDescription('Vision App API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Health check endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('guardians', 'Guardian/parental controls')
    .addTag('connectors', 'Data connectors')
    .addTag('goals', 'Goals management')
    .addTag('roadmaps', 'Roadmaps and milestones')
    .addTag('recommendations', 'AI recommendations')
    .addTag('ai', 'AI assistant')
    .addTag('tokens', 'Token management')
    .addTag('sponsorship', 'Sponsorship and payments')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Vision API running on http://localhost:${port}`);
  logger.log(`API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`Health endpoints: /healthz (liveness), /readyz (readiness)`);

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, starting graceful shutdown...`);
    await app.close();
    logger.log('Application closed');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
