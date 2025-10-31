import { DeleteCameraStore } from "./delete-camera.store";
import { DeleteCameraStoreContext } from "./delete-camera-store.context";
import { useContextStore } from "@/core/presentation/hooks/useContextStore";

export const useDeleteCameraStore = (): DeleteCameraStore => {
  const store = useContextStore(DeleteCameraStoreContext);

  return store;
};