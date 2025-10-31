import { observer } from "mobx-react";
import CameraEntity from "../../domain/entities/camera.entity";
import CameraItem from "./camera-item.component";

interface CameraListProps {
  cameras: CameraEntity[];
  isLoading: boolean;
  emptyMessage?: string;
}

const CameraList = observer(
  ({ cameras, isLoading, emptyMessage = "No cameras found" }: CameraListProps) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500">Loading cameras...</div>
        </div>
      );
    }

    if (cameras.length === 0) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500">{emptyMessage}</div>
        </div>
      );
    }

    return (
      <div className="overflow-y-scroll h-full">
        {cameras.map((camera) => (
          <CameraItem key={camera.id} camera={camera} />
        ))}
      </div>
    );
  }
);

export default CameraList;