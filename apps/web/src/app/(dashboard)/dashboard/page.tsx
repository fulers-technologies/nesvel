export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard widgets */}
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Total Users</h3>
          <p className="mt-2 text-3xl font-bold">1,234</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Revenue</h3>
          <p className="mt-2 text-3xl font-bold">$12,345</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Active Sessions</h3>
          <p className="mt-2 text-3xl font-bold">567</p>
        </div>
      </div>
    </div>
  );
}
