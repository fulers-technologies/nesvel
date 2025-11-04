import { PropsWithChildren } from "react";
import { GetCameraStore } from "./get-camera.store";
import { GetCameraStoreContext } from "./get-camera-store.context";
import { cameraModuleContainer } from "@/camera/camera.module";

export const GetCameraStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <GetCameraStoreContext.Provider
      value={cameraModuleContainer.getProvided(GetCameraStore)}
    >
      {children}
    </GetCameraStoreContext.Provider>
  );
};