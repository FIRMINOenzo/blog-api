import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './infra/filters/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new DomainExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription(
      'API RESTful for blog management with JWT authentication and permission control',
    )
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Accounts', 'Account management')
    .addTag('Articles', 'Article management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use('/docs', apiReference({ content: document }));

  await app.listen(process.env.PORT ?? 3000, () =>
    console.log(`
    🚀 Application is running on port ${process.env.PORT ?? 3000}
    📚 API Documentation: http://localhost:${process.env.PORT ?? 3000}/docs
    `),
  );
}
void bootstrap();
