import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { I18n, I18nContext } from '@nesvel/nestjs-i18n';

@ApiTags('app')
@Controller()
export class AppController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Returns a welcome message in the requested language',
    schema: {
      type: 'string',
      example: 'Welcome to Nesvel API',
    },
  })
  async getHello(@I18n() i18n: I18nContext): Promise<string> {
    return i18n.t('common.welcome');
  }

  @Get('hello/:name')
  @ApiOperation({ summary: 'Get personalized greeting' })
  @ApiResponse({
    status: 200,
    description: 'Returns a personalized greeting in the requested language',
    schema: {
      type: 'string',
      example: 'Hello, John!',
    },
  })
  async getGreeting(
    @I18n() i18n: I18nContext,
    @Param('name') name: string,
  ): Promise<string> {
    return i18n.t('common.hello', { args: { name } });
  }
}
