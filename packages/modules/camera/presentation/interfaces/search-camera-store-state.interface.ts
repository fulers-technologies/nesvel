import CameraEntity from "../../domain/entities/camera.entity";

export default interface SearchCameraStoreState {
  isLoading: boolean;
  results: CameraEntity[];
  count: number;
  query: string;
  pagination: {
    page: number;
    pageSize: number;
  };
}