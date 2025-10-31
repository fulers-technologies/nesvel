import { UpdateCameraStore } from "./update-camera.store";
import { UpdateCameraStoreContext } from "./update-camera-store.context";
import { useContextStore } from "@/core/presentation/hooks/useContextStore";

export const useUpdateCameraStore = (): UpdateCameraStore => {
  const store = useContextStore(UpdateCameraStoreContext);

  return store;
};