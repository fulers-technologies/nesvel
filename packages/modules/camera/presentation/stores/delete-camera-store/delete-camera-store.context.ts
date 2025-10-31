import { createContext } from "react";
import { DeleteCameraStore } from "./delete-camera.store";

export const DeleteCameraStoreContext = createContext<DeleteCameraStore | null>(null);

DeleteCameraStoreContext.displayName = "DeleteCameraStoreContext";