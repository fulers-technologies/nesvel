/**
 * User List Page
 */

import { Component } from 'react';
import { Link } from 'react-router';
import { Route, getService } from '@nesvel/reactjs-di';
import { USER_SERVICE } from '../user.token';
import type { IUserService, IUser } from '../user.service';

interface UserListPageState {
  users: IUser[];
  loading: boolean;
}

@Route({
  path: '/users',
  meta: {
    title: 'Users',
  },
})
export class UserListPage extends Component<{}, UserListPageState> {
  private userService: IUserService;

  constructor(props: {}) {
    super(props);
    this.userService = getService<IUserService>(USER_SERVICE);
    this.state = {
      users: [],
      loading: true,
    };
  }

  async componentDidMount() {
    try {
      const data = await this.userService.getAll();
      this.setState({ users: data, loading: false });
    } catch (error) {
      console.error('Failed to load users:', error);
      this.setState({ loading: false });
    }
  }

  render() {
    const { users, loading } = this.state;

    if (loading) {
      return <div className="p-8">Loading users...</div>;
    }

    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Users</h1>

          <div className="space-y-4">
            {users.map((user) => (
              <Link
                key={user.id}
                to={`/users/${user.id}`}
                className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors"
              >
                <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link to="/" className="text-blue-400 hover:text-blue-300">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
