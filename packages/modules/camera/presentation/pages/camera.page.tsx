import { useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { withProviders } from "@/core/presentation/utils/withProviders";
import { GetCameraStoreProvider } from "../stores/get-camera-store/get-camera-store.provider";
import { useGetCameraStore } from "../stores/get-camera-store/use-get-camera-store";
import CameraList from "../components/camera-list.component";
import CameraListSkeleton from "../skeletons/camera-list.skeleton";

const CameraPage = observer(() => {
  const { t } = useTranslation(["camera"]);
  const getCameraStore = useGetCameraStore();
  const { results, isLoading } = getCameraStore;

  useEffect(() => {
    getCameraStore.getCameras();
  }, [getCameraStore]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-300">
        <h1 className="text-2xl font-bold">{t("camera:pages.CameraPage.title")}</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <CameraListSkeleton count={5} />
        ) : (
          <CameraList
            cameras={results}
            isLoading={isLoading}
            emptyMessage={t("camera:pages.CameraPage.empty")}
          />
        )}
      </div>
    </div>
  );
});

export default withProviders(GetCameraStoreProvider)(CameraPage);