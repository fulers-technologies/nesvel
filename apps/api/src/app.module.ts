import { Module } from '@nestjs/common';
import { I18nModule } from '@nesvel/nestjs-i18n';
import { SwaggerModule } from '@nesvel/nestjs-swagger';

import { AppService } from './services/app.service';
import { AppController } from './controllers/app.controller';
import { UserController } from './controllers/user.controller';
import { i18nConfig } from './config/i18n.config';
import { swaggerConfig } from './config/swagger.config';

@Module({
  imports: [
    I18nModule.forRoot(i18nConfig),
    SwaggerModule.forRoot(swaggerConfig),
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
