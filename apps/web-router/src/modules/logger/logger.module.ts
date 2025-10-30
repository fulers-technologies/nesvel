/**
 * Logger Module
 */

import { module } from '@nesvel/reactjs-di';
import { LOGGER_SERVICE } from './logger.token';
import { LoggerService } from './logger.service';

@module({
  providers: [
    {
      provide: LOGGER_SERVICE,
      useClass: LoggerService,
    },
  ],
  exports: [LOGGER_SERVICE],
})
export class LoggerModule {}
