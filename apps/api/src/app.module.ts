import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { I18nModule } from '@nesvel/nestjs-i18n';
import { SearchModule } from '@nesvel/nestjs-search';
import { SwaggerModule } from '@nesvel/nestjs-swagger';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PubSubModule } from '@nesvel/nestjs-pubsub';
import { MailModule } from '@nesvel/nestjs-mail';
import { StorageModule } from '@nesvel/nestjs-storage';
import { HttpModule } from '@nesvel/nestjs-http';
import { HashingModule } from '@nesvel/nestjs-hashing';
import { EncryptionModule } from '@nesvel/nestjs-encryption';

import { AppController } from './controllers/app.controller';
import { StorageController } from './controllers/storage.controller';
import { HttpTestController } from './controllers/http-test.controller';
import { HashingController } from './controllers/hashing.controller';
import { EncryptionController } from './controllers/encryption.controller';
import { TestUser } from './entities/test-user.entity';
import { databaseConfig } from './config/database.config';
import { i18nConfig } from './config/i18n.config';
import { swaggerConfig } from './config/swagger.config';
import { searchConfig } from './config/search.config';
import { rateLimitConfig } from './config/rate-limit.config';
import { pubsubConfig } from './config/pubsub.config';
import { mailConfig } from './config/mail.config';
import { storageConfig } from './config/storage.config';
import { hashingConfig } from './config/hashing.config';
import { encryptionConfig } from './config/encryption.config';
import { OrderModule } from './modules/order/order.module';
import { TestUserRepository } from './repositories/test-user.repository';
import { OrderListener } from './listeners/order.listener';
import { OrderPublisher } from './publishers/order.publisher';
import { PaymentConsumer } from './consumers/payment.consumer';

@Module({
  imports: [
    // Database configuration (MikroORM)
    MikroOrmModule.forRoot(databaseConfig),

    // Rate limiting configuration
    ThrottlerModule.forRoot(rateLimitConfig),

    // I18n configuration
    I18nModule.forRoot(i18nConfig),

    // Swagger documentation
    SwaggerModule.forRoot(swaggerConfig),

    // Search configuration
    SearchModule.forRoot(searchConfig),

    PubSubModule.forRoot(pubsubConfig),

    // Register TestUser entity for repository injection
    MikroOrmModule.forFeature([TestUser]),

    MailModule.forRoot(mailConfig),

    // Storage configuration
    StorageModule.register(storageConfig),

    // HTTP client configuration
    HttpModule.register(),

    // Hashing configuration
    HashingModule.forRoot(hashingConfig),

    // Encryption configuration
    EncryptionModule.forRoot(encryptionConfig),

    OrderModule,
  ],
  controllers: [
    AppController,
    StorageController,
    HttpTestController,
    HashingController,
    EncryptionController,
  ],
  providers: [
    // Apply throttler guard globally to all routes
    // Individual routes can opt-out using @SkipThrottle() decorator
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    TestUserRepository,

    OrderListener,
    OrderPublisher,
    PaymentConsumer,
  ],
  exports: [],
})
export class AppModule {}
