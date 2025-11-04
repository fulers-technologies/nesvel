import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { withProviders } from "@/core/presentation/utils/withProviders";
import { FindCameraStoreProvider } from "../stores/find-camera-store/find-camera-store.provider";
import { UpdateCameraStoreProvider } from "../stores/update-camera-store/update-camera-store.provider";
import { DeleteCameraStoreProvider } from "../stores/delete-camera-store/delete-camera-store.provider";
import { useFindCameraStore } from "../stores/find-camera-store/use-find-camera-store";
import { useUpdateCameraStore } from "../stores/update-camera-store/use-update-camera-store";
import { useDeleteCameraStore } from "../stores/delete-camera-store/use-delete-camera-store";
import CameraForm from "../components/camera-form.component";
import CameraDetailSkeleton from "../skeletons/camera-detail.skeleton";
import UpdateCameraPayload from "../../application/interfaces/update-camera-payload.interface";

const CameraDetailPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["camera"]);
  const findCameraStore = useFindCameraStore();
  const updateCameraStore = useUpdateCameraStore();
  const deleteCameraStore = useDeleteCameraStore();
  const { camera, isLoading } = findCameraStore;
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      findCameraStore.findCamera(parseInt(id));
    }
  }, [findCameraStore, id]);

  const handleUpdate = async (data: UpdateCameraPayload) => {
    if (id) {
      try {
        await updateCameraStore.updateCamera(parseInt(id), data);
        setIsEditing(false);
        findCameraStore.findCamera(parseInt(id)); // Refresh data
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  const handleDelete = async () => {
    if (id && window.confirm(t("camera:pages.CameraDetailPage.deleteConfirm"))) {
      try {
        await deleteCameraStore.deleteCamera(parseInt(id));
        navigate("/cameras");
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  if (isLoading) {
    return <CameraDetailSkeleton />;
  }

  if (!camera) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>{t("camera:pages.CameraDetailPage.notFound")}</p>
      </div>
    );
  }

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    maintenance: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {t("camera:pages.CameraDetailPage.title")}
          </h1>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t("camera:pages.CameraDetailPage.edit")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteCameraStore.isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                >
                  {deleteCameraStore.isLoading
                    ? t("camera:pages.CameraDetailPage.deleting")
                    : t("camera:pages.CameraDetailPage.delete")}
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {t("camera:pages.CameraDetailPage.editTitle")}
            </h2>
            <CameraForm
              camera={camera}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={updateCameraStore.isLoading}
              submitLabel={t("camera:pages.CameraDetailPage.update")}
            />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{camera.name}</h2>
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    statusColors[camera.status]
                  }`}
                >
                  {camera.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {t("camera:pages.CameraDetailPage.location")}
                </h3>
                <p className="text-lg">{camera.location}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {t("camera:pages.CameraDetailPage.ipAddress")}
                </h3>
                <p className="text-lg font-mono">{camera.ipAddress}</p>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {t("camera:pages.CameraDetailPage.streamUrl")}
                </h3>
                <p className="text-lg font-mono break-all">{camera.streamUrl}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {t("camera:pages.CameraDetailPage.createdAt")}
                </h3>
                <p className="text-lg">
                  {new Date(camera.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {t("camera:pages.CameraDetailPage.updatedAt")}
                </h3>
                <p className="text-lg">
                  {new Date(camera.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default withProviders(
  FindCameraStoreProvider,
  UpdateCameraStoreProvider,
  DeleteCameraStoreProvider
)(CameraDetailPage);