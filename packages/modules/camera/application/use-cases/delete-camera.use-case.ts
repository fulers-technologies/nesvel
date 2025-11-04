import { injectable, inject } from "inversiland";
import {
  ICameraRepository,
  ICameraRepositoryToken,
} from "../../domain/interfaces/camera-repository.interface";

@injectable()
export default class DeleteCameraUseCase {
  constructor(
    @inject(ICameraRepositoryToken)
    private readonly cameraRepository: ICameraRepository
  ) {}

  public execute(id: number) {
    return this.cameraRepository.delete(id);
  }
}