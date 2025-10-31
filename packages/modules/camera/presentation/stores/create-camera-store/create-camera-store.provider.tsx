import { PropsWithChildren } from "react";
import { CreateCameraStoreContext } from "./create-camera-store.context";
import { CreateCameraStore } from "./create-camera.store";
import { cameraModuleContainer } from "@/camera/camera.module";

export const CreateCameraStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <CreateCameraStoreContext.Provider
      value={cameraModuleContainer.getProvided(CreateCameraStore)}
    >
      {children}
    </CreateCameraStoreContext.Provider>
  );
};