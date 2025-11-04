import { useState } from "react";
import CreateCameraPayload from "../../application/interfaces/create-camera-payload.interface";
import UpdateCameraPayload from "../../application/interfaces/update-camera-payload.interface";
import CameraEntity from "../../domain/entities/camera.entity";

interface CameraFormProps {
  camera?: CameraEntity;
  onSubmit: (data: CreateCameraPayload | UpdateCameraPayload) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const CameraForm = ({
  camera,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Submit",
}: CameraFormProps) => {
  const [formData, setFormData] = useState({
    name: camera?.name || "",
    location: camera?.location || "",
    status: camera?.status || ("active" as const),
    ipAddress: camera?.ipAddress || "",
    streamUrl: camera?.streamUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Camera Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter camera name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter camera location"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status *
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          IP Address *
        </label>
        <input
          type="text"
          name="ipAddress"
          value={formData.ipAddress}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 192.168.1.100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stream URL *
        </label>
        <input
          type="url"
          name="streamUrl"
          value={formData.streamUrl}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., rtsp://192.168.1.100/stream"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default CameraForm;