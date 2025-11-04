import { createContext } from "react";
import { FindCameraStore } from "./find-camera.store";

export const FindCameraStoreContext = createContext<FindCameraStore | null>(null);

FindCameraStoreContext.displayName = "FindCameraStoreContext";