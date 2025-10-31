import { FindCameraStore } from "./find-camera.store";
import { FindCameraStoreContext } from "./find-camera-store.context";
import { useContextStore } from "@/core/presentation/hooks/useContextStore";

export const useFindCameraStore = (): FindCameraStore => {
  const store = useContextStore(FindCameraStoreContext);

  return store;
};