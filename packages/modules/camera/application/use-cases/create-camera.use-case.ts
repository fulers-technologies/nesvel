import { injectable, inject } from "inversiland";
import {
  ICameraRepository,
  ICameraRepositoryToken,
} from "../../domain/interfaces/camera-repository.interface";
import CreateCameraPayload from "../interfaces/create-camera-payload.interface";
import { UseCase } from "@/core/application/UseCase";
import CameraEntity from "../../domain/entities/camera.entity";

@injectable()
export default class CreateCameraUseCase
  implements UseCase<CreateCameraPayload, Promise<CameraEntity>>
{
  constructor(
    @inject(ICameraRepositoryToken)
    private readonly cameraRepository: ICameraRepository
  ) {}

  public execute(data: CreateCameraPayload) {
    return this.cameraRepository.create(data);
  }
}