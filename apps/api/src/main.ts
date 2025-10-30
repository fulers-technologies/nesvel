import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerSetupService } from '@nesvel/nestjs-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Swagger documentation
  const swaggerSetup = app.get(SwaggerSetupService);
  swaggerSetup.setup(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
void bootstrap();
