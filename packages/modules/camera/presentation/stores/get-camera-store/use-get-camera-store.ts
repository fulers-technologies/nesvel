import { useContextStore } from "@/core/presentation/hooks/useContextStore";
import { GetCameraStore } from "./get-camera.store";
import { GetCameraStoreContext } from "./get-camera-store.context";

export const useGetCameraStore = (): GetCameraStore => {
  const store = useContextStore(GetCameraStoreContext);

  return store;
};