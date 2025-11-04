import { injectable, inject } from "inversiland";
import { makeAutoObservable } from "mobx";
import { ToastService } from "@/core/presentation/services/ToastService";
import DeleteCameraStoreState from "../../types/delete-camera-store-state.interface";
import DeleteCameraUseCase from "@/camera/application/use-cases/delete-camera.use-case";

@injectable()
export class DeleteCameraStore implements DeleteCameraStoreState {
  isLoading = false;
  error: string | null = null;

  constructor(
    @inject(ToastService) private readonly toastService: ToastService,
    @inject(DeleteCameraUseCase)
    private deleteCameraUseCase: DeleteCameraUseCase
  ) {
    makeAutoObservable(this);
  }

  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  async deleteCamera(id: number) {
    try {
      this.setIsLoading(true);
      this.setError(null);
      await this.deleteCameraUseCase.execute(id);
      this.toastService.success("Camera deleted successfully");
    } catch (error: any) {
      this.setError(error.message || "Failed to delete camera");
      this.toastService.error(error.message);
      throw error;
    } finally {
      this.setIsLoading(false);
    }
  }

  reset() {
    this.error = null;
  }
}