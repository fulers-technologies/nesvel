const CameraFormSkeleton = () => {
  return (
    <div className="space-y-4 max-w-2xl animate-pulse">
      {/* Camera Name field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Location field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Status field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>

      {/* IP Address field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Stream URL field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};

export default CameraFormSkeleton;
