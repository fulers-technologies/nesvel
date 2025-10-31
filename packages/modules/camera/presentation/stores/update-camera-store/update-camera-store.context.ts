import { createContext } from "react";
import { UpdateCameraStore } from "./update-camera.store";

export const UpdateCameraStoreContext = createContext<UpdateCameraStore | null>(null);

UpdateCameraStoreContext.displayName = "UpdateCameraStoreContext";