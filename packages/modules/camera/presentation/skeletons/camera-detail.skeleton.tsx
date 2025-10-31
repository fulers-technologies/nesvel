const CameraDetailSkeleton = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center animate-pulse">
          <div className="h-9 bg-gray-200 rounded w-48"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* Content card */}
        <div className="bg-white p-6 rounded-lg shadow space-y-6 animate-pulse">
          {/* Title and status */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-64"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-40"></div>
            </div>

            {/* IP Address */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Stream URL (full width) */}
            <div className="md:col-span-2">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>

            {/* Created At */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>

            {/* Updated At */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraDetailSkeleton;
