import { PropsWithChildren } from "react";
import { SearchCameraStore } from "./search-camera.store";
import { SearchCameraStoreContext } from "./search-camera-store.context";
import { cameraModuleContainer } from "@/camera/camera.module";

export const SearchCameraStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <SearchCameraStoreContext.Provider
      value={cameraModuleContainer.getProvided(SearchCameraStore)}
    >
      {children}
    </SearchCameraStoreContext.Provider>
  );
};