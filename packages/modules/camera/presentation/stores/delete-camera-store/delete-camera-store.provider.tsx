import { PropsWithChildren } from "react";
import { DeleteCameraStoreContext } from "./delete-camera-store.context";
import { DeleteCameraStore } from "./delete-camera.store";
import { cameraModuleContainer } from "@/camera/camera.module";

export const DeleteCameraStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <DeleteCameraStoreContext.Provider
      value={cameraModuleContainer.getProvided(DeleteCameraStore)}
    >
      {children}
    </DeleteCameraStoreContext.Provider>
  );
};