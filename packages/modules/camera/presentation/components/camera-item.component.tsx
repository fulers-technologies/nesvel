import { useNavigate } from "react-router-dom";
import CameraEntity from "../../domain/entities/camera.entity";

interface CameraItemProps {
  camera: CameraEntity;
}

const CameraItem = ({ camera }: CameraItemProps) => {
  const { name, location, status, ipAddress } = camera;
  const navigate = useNavigate();
  const onClick = () => {
    navigate(`/cameras/${camera.id}`);
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    maintenance: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="cursor-pointer group" onClick={onClick}>
      <div className="p-4 border-b border-gray-300 group-hover:bg-gray-100">
        <div className="flex justify-between items-start mb-2">
          <span className="text-lg font-bold">{name}</span>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status]
              }`}
          >
            {status}
          </span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <span className="font-medium">Location:</span> {location}
          </div>
          <div>
            <span className="font-medium">IP Address:</span> {ipAddress}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraItem;