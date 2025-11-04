import { injectable, inject } from "inversiland";
import { makeAutoObservable } from "mobx";
import { ToastService } from "@/core/presentation/services/ToastService";
import SearchCameraStoreState from "../../types/search-camera-store-state.interface";
import SearchCameraUseCase from "@/camera/application/use-cases/search-camera.use-case";
import SearchCameraPayload from "@/camera/application/interfaces/search-camera-payload.interface";

@injectable()
export class SearchCameraStore implements SearchCameraStoreState {
  isLoading = false;
  results = [] as SearchCameraStoreState["results"];
  count = 0;
  query = "";
  pagination = {
    page: 1,
    pageSize: 25,
  };

  constructor(
    @inject(ToastService) private readonly toastService: ToastService,
    @inject(SearchCameraUseCase)
    private readonly searchCameraUseCase: SearchCameraUseCase
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

  setResults = (results: SearchCameraStoreState["results"]) => {
    this.results = results;
  };

  setCount = (count: SearchCameraStoreState["count"]) => {
    this.count = count;
  };

  setQuery = (query: string) => {
    this.query = query;
  };

  mergePagination = (
    payload: Partial<SearchCameraStoreState["pagination"]>
  ): void => {
    Object.assign(this.pagination, payload);
  };

  async searchCameras() {
    const payload: SearchCameraPayload = {
      query: this.query,
      ...this.pagination,
    };

    this.setIsLoading(true);

    return this.searchCameraUseCase
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