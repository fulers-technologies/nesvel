/**
 * User Module
 *
 * Example module demonstrating RouteModule with controllers and routes
 */

import { RouteModule } from '@nesvel/reactjs-di';
import { UserService } from './user.service';
import { USER_SERVICE } from './user.token';
import { UserListPage } from './pages/user-list.page';
import { UserDetailPage } from './pages/user-detail.page';

@RouteModule({
  providers: [
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
  ],
  exports: [USER_SERVICE],
  routes: [UserListPage as any, UserDetailPage as any],
})
export class UserModule {}
