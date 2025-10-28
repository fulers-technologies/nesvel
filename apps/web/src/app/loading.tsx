export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
