import { createContext } from "react";
import { SearchCameraStore } from "./search-camera.store";

export const SearchCameraStoreContext = createContext<SearchCameraStore | null>(null);

SearchCameraStoreContext.displayName = "SearchCameraStoreContext";