import { injectable, inject } from "inversiland";
import { makeAutoObservable } from "mobx";
import { ToastService } from "@/core/presentation/services/ToastService";
import UpdateCameraStoreState from "../../types/update-camera-store-state.interface";
import CameraEntity from "@/camera/domain/entities/camera.entity";
import UpdateCameraUseCase from "@/camera/application/use-cases/update-camera.use-case";
import UpdateCameraPayload from "@/camera/application/interfaces/update-camera-payload.interface";

@injectable()
export class UpdateCameraStore implements UpdateCameraStoreState {
  isLoading = false;
  camera: CameraEntity | null = null;
  error: string | null = null;

  constructor(
    @inject(ToastService) private readonly toastService: ToastService,
    @inject(UpdateCameraUseCase)
    private updateCameraUseCase: UpdateCameraUseCase
  ) {
    makeAutoObservable(this);
  }

  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  setCamera(camera: CameraEntity | null) {
    this.camera = camera;
  }

  setError(error: string | null) {
    this.error = error;
  }

  async updateCamera(id: number, payload: UpdateCameraPayload) {
    try {
      this.setIsLoading(true);
      this.setError(null);
      const camera = await this.updateCameraUseCase.execute(id, payload);
      this.setCamera(camera);
      this.toastService.success("Camera updated successfully");
      return camera;
    } catch (error: any) {
      this.setError(error.message || "Failed to update camera");
      this.toastService.error(error.message);
      throw error;
    } finally {
      this.setIsLoading(false);
    }
  }

  reset() {
    this.camera = null;
    this.error = null;
  }
}