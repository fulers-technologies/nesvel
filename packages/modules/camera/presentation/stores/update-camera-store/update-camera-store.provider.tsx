import { PropsWithChildren } from "react";
import { UpdateCameraStoreContext } from "./update-camera-store.context";
import { UpdateCameraStore } from "./update-camera.store";
import { cameraModuleContainer } from "@/camera/camera.module";

export const UpdateCameraStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <UpdateCameraStoreContext.Provider
      value={cameraModuleContainer.getProvided(UpdateCameraStore)}
    >
      {children}
    </UpdateCameraStoreContext.Provider>
  );
};