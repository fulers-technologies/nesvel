import CameraEntity from "../../domain/entities/camera.entity";

export default interface FindCameraStoreState {
  isLoading: boolean;
  camera: CameraEntity | null;
}