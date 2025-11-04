import CameraEntity from "../entities/camera.entity";
import SearchCameraPayload from "../../application/interfaces/search-camera-payload.interface";
import SearchCameraResponse from "../../application/interfaces/search-camera-response.interface";
import GetCameraPayload from "../../application/interfaces/get-camera-payload.interface";
import GetCameraResponse from "../../application/interfaces/get-camera-response.interface";
import CreateCameraPayload from "../../application/interfaces/create-camera-payload.interface";
import UpdateCameraPayload from "../../application/interfaces/update-camera-payload.interface";

export const ICameraRepositoryToken = Symbol();

export interface ICameraRepository {
  search: (data: SearchCameraPayload) => Promise<SearchCameraResponse>;
  find: (id: number) => Promise<CameraEntity>;
  get: (data: GetCameraPayload) => Promise<GetCameraResponse>;
  create: (data: CreateCameraPayload) => Promise<CameraEntity>;
  update: (id: number, data: UpdateCameraPayload) => Promise<CameraEntity>;
  delete: (id: number) => Promise<void>;
}