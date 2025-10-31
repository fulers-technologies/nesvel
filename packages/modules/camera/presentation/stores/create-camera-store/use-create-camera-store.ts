import { CreateCameraStore } from "./create-camera.store";
import { CreateCameraStoreContext } from "./create-camera-store.context";
import { useContextStore } from "@/core/presentation/hooks/useContextStore";

export const useCreateCameraStore = (): CreateCameraStore => {
  const store = useContextStore(CreateCameraStoreContext);

  return store;
};