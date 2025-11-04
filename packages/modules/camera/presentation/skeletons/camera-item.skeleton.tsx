const CameraItemSkeleton = () => {
  return (
    <div className="p-4 border-b border-gray-300 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        {/* Camera name skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        {/* Status badge skeleton */}
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="space-y-2">
        {/* Location skeleton */}
        <div className="h-4 bg-gray-200 rounded w-2/5"></div>
        {/* IP Address skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default CameraItemSkeleton;
