import { injectable, inject } from "inversiland";
import { makeAutoObservable } from "mobx";
import { ToastService } from "@/core/presentation/services/ToastService";
import GetCameraStoreState from "../../types/get-camera-store-state.interface";
import GetCameraUseCase from "@/camera/application/use-cases/get-camera.use-case";
import GetCameraPayload from "@/camera/application/interfaces/get-camera-payload.interface";

@injectable()
export class GetCameraStore implements GetCameraStoreState {
  isLoading = false;
  results = [] as GetCameraStoreState["results"];
  count = 0;
  filters = {};
  pagination = {
    page: 1,
    pageSize: 25,
  };

  constructor(
    @inject(ToastService) private readonly toastService: ToastService,
    @inject(GetCameraUseCase)
    private readonly getCameraUseCase: GetCameraUseCase
  ) {
    makeAutoObservable(this);
  }

  get pageCount() {
    return Math.ceil(this.count / this.pagination.pageSize);
  }

  get isEmpty(): boolean {
    return this.results.length === 0;
  }

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setResults = (results: GetCameraStoreState["results"]) => {
    this.results = results;
  };

  setCount = (count: GetCameraStoreState["count"]) => {
    this.count = count;
  };

  mergeFilters = (payload: Partial<GetCameraStoreState["filters"]>) => {
    Object.assign(this.filters, payload);
  };

  mergePagination = (
    payload: Partial<GetCameraStoreState["pagination"]>
  ): void => {
    Object.assign(this.pagination, payload);
  };

  async getCameras() {
    const payload: GetCameraPayload = {
      ...this.filters,
      ...this.pagination,
    };

    this.setIsLoading(true);

    return this.getCameraUseCase
      .execute(payload)
      .then((response) => {
        this.setResults(response.results);
        this.setCount(response.count);
      })
      .catch((error) => {
        this.toastService.error(error.message);
      })
      .finally(() => {
        this.setIsLoading(false);
      });
  }
}