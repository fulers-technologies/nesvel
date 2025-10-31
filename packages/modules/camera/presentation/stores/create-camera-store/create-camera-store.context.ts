import { createContext } from "react";
import { CreateCameraStore } from "./create-camera.store";

export const CreateCameraStoreContext = createContext<CreateCameraStore | null>(null);

CreateCameraStoreContext.displayName = "CreateCameraStoreContext";