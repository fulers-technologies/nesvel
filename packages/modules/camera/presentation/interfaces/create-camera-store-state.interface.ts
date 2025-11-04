import CameraEntity from "../../domain/entities/camera.entity";

export default interface CreateCameraStoreState {
  isLoading: boolean;
  camera: CameraEntity | null;
  error: string | null;
}