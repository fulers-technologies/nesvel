import { injectable, inject } from "inversiland";
import { makeAutoObservable } from "mobx";
import { ToastService } from "@/core/presentation/services/ToastService";
import CreateCameraStoreState from "../../types/create-camera-store-state.interface";
import CameraEntity from "@/camera/domain/entities/camera.entity";
import CreateCameraUseCase from "@/camera/application/use-cases/create-camera.use-case";
import CreateCameraPayload from "@/camera/application/interfaces/create-camera-payload.interface";

@injectable()
export class CreateCameraStore implements CreateCameraStoreState {
  isLoading = false;
  camera: CameraEntity | null = null;
  error: string | null = null;

  constructor(
    @inject(ToastService) private readonly toastService: ToastService,
    @inject(CreateCameraUseCase)
    private createCameraUseCase: CreateCameraUseCase
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

  async createCamera(payload: CreateCameraPayload) {
    try {
      this.setIsLoading(true);
      this.setError(null);
      const camera = await this.createCameraUseCase.execute(payload);
      this.setCamera(camera);
      this.toastService.success("Camera created successfully");
      return camera;
    } catch (error: any) {
      this.setError(error.message || "Failed to create camera");
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