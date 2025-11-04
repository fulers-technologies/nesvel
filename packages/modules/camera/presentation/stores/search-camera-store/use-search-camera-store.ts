import { useContextStore } from "@/core/presentation/hooks/useContextStore";
import { SearchCameraStore } from "./search-camera.store";
import { SearchCameraStoreContext } from "./search-camera-store.context";

export const useSearchCameraStore = (): SearchCameraStore => {
  const store = useContextStore(SearchCameraStoreContext);

  return store;
};