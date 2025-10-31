import { injectable, inject } from "inversiland";
import {
  ICameraRepository,
  ICameraRepositoryToken,
} from "../../domain/interfaces/camera-repository.interface";
import SearchCameraPayload from "../interfaces/search-camera-payload.interface";
import { UseCase } from "@/core/application/UseCase";
import SearchCameraResponse from "../interfaces/search-camera-response.interface";

@injectable()
export default class SearchCameraUseCase
  implements UseCase<SearchCameraPayload, Promise<SearchCameraResponse>>
{
  constructor(
    @inject(ICameraRepositoryToken)
    private readonly cameraRepository: ICameraRepository
  ) {}

  public execute(data: SearchCameraPayload) {
    return this.cameraRepository.search(data);
  }
}