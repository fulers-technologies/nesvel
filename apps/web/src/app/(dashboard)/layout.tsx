import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Nesvel',
  description: 'Dashboard pages layout',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <div className="p-4">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <nav className="mt-8 space-y-2">
            {/* Dashboard navigation */}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="border-b bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <div>{/* User menu */}</div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
