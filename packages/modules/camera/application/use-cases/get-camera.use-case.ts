import {
  ICameraRepository,
  ICameraRepositoryToken,
} from "../../domain/interfaces/camera-repository.interface";
import GetCameraPayload from "../interfaces/get-camera-payload.interface";
import { injectable, inject } from "inversiland";
import { UseCase } from "@/core/application/UseCase";
import GetCameraResponse from "../interfaces/get-camera-response.interface";

@injectable()
export default class GetCameraUseCase
  implements UseCase<GetCameraPayload, Promise<GetCameraResponse>>
{
  constructor(
    @inject(ICameraRepositoryToken)
    private readonly cameraRepository: ICameraRepository
  ) {}

  public execute(data: GetCameraPayload) {
    return this.cameraRepository.get(data);
  }
}