/**
 * App Module (Root)
 *
 * The root module that imports all feature modules.
 */

import { module } from '@nesvel/reactjs-di';
import { LoggerModule } from './logger';
import { ConfigModule } from './config';
import { UserModule } from './user';

@module({
  imports: [LoggerModule, ConfigModule, UserModule],
})
export class AppModule {}
