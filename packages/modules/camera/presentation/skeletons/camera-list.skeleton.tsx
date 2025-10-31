import CameraItemSkeleton from "./camera-item.skeleton";

interface CameraListSkeletonProps {
  count?: number;
}

const CameraListSkeleton = ({ count = 5 }: CameraListSkeletonProps) => {
  return (
    <div className="overflow-y-scroll h-full">
      {Array.from({ length: count }).map((_, index) => (
        <CameraItemSkeleton key={index} />
      ))}
    </div>
  );
};

export default CameraListSkeleton;
