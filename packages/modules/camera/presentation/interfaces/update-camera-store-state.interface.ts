import CameraEntity from "../../domain/entities/camera.entity";

export default interface UpdateCameraStoreState {
  isLoading: boolean;
  camera: CameraEntity | null;
  error: string | null;
}