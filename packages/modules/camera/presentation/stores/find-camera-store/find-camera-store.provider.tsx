import { PropsWithChildren } from "react";
import { FindCameraStoreContext } from "./find-camera-store.context";
import { FindCameraStore } from "./find-camera.store";
import { cameraModuleContainer } from "@/camera/camera.module";

export const FindCameraStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <FindCameraStoreContext.Provider
      value={cameraModuleContainer.getProvided(FindCameraStore)}
    >
      {children}
    </FindCameraStoreContext.Provider>
  );
};