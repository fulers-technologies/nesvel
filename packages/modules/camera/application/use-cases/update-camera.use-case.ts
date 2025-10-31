import { injectable, inject } from "inversiland";
import {
  ICameraRepository,
  ICameraRepositoryToken,
} from "../../domain/interfaces/camera-repository.interface";
import UpdateCameraPayload from "../interfaces/update-camera-payload.interface";

@injectable()
export default class UpdateCameraUseCase {
  constructor(
    @inject(ICameraRepositoryToken)
    private readonly cameraRepository: ICameraRepository
  ) {}

  public execute(id: number, data: UpdateCameraPayload) {
    return this.cameraRepository.update(id, data);
  }
}