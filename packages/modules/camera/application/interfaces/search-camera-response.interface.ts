import CameraEntity from "../../domain/entities/camera.entity";

export default interface SearchCameraResponse {
  results: CameraEntity[];
  count: number;
}