import { createContext } from "react";
import { GetCameraStore } from "./get-camera.store";

export const GetCameraStoreContext = createContext<GetCameraStore | null>(null);

GetCameraStoreContext.displayName = "GetCameraStoreContext";