/**
 * User Detail Page
 */

import { Component } from 'react';
import { Link } from 'react-router';
import { Route, getService } from '@nesvel/reactjs-di';
import { USER_SERVICE } from '../user.token';
import type { IUserService, IUser } from '../user.service';

interface UserDetailPageProps {
  params: {
    id: string;
  };
}

interface UserDetailPageState {
  user: IUser | null;
  loading: boolean;
}

@Route({
  path: '/users/:id',
  meta: {
    title: 'User Detail',
  },
})
export class UserDetailPage extends Component<UserDetailPageProps, UserDetailPageState> {
  private userService: IUserService;

  constructor(props: UserDetailPageProps) {
    super(props);
    this.userService = getService<IUserService>(USER_SERVICE);
    this.state = {
      user: null,
      loading: true,
    };
  }

  async componentDidMount() {
    const { id } = this.props.params;
    if (id) {
      try {
        const data = await this.userService.getById(id);
        this.setState({ user: data, loading: false });
      } catch (error) {
        console.error('Failed to load user:', error);
        this.setState({ loading: false });
      }
    }
  }

  render() {
    const { user, loading } = this.state;

    if (loading) {
      return <div className="p-8">Loading user...</div>;
    }

    if (!user) {
      return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">User Not Found</h1>
            <Link to="/users" className="text-blue-400 hover:text-blue-300">
              ← Back to Users
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">User Details</h1>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">ID</label>
                <p className="text-lg">{user.id}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-x-4">
            <Link to="/users" className="text-blue-400 hover:text-blue-300">
              ← Back to Users
            </Link>
            <Link to="/" className="text-blue-400 hover:text-blue-300">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
