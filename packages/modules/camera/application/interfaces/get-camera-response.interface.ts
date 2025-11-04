import CameraEntity from "../../domain/entities/camera.entity";

export default interface GetCameraResponse {
  results: CameraEntity[];
  count: number;
}