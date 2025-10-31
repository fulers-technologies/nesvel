import { injectable, inject } from "inversiland";
import { makeAutoObservable } from "mobx";
import FindCameraStoreState from "../../types/find-camera-store-state.interface";
import CameraEntity from "@/camera/domain/entities/camera.entity";
import FindCameraUseCase from "@/camera/application/use-cases/find-camera.use-case";

@injectable()
export class FindCameraStore implements FindCameraStoreState {
  isLoading = false;
  camera: CameraEntity | null = null;

  constructor(
    @inject(FindCameraUseCase)
    private findCameraUseCase: FindCameraUseCase
  ) {
    makeAutoObservable(this);
  }

  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  setCamera(camera: CameraEntity | null) {
    this.camera = camera;
  }

  async findCamera(id: number) {
    try {
      this.setIsLoading(true);
      this.setCamera(await this.findCameraUseCase.execute(id));
    } catch (error) {
    } finally {
      this.setIsLoading(false);
    }
  }
}