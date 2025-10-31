import { getModuleContainer, module } from "inversiland";
import SearchCameraUseCase from "./application/use-cases/search-camera.use-case";
import FindCameraUseCase from "./application/use-cases/find-camera.use-case";
import GetCameraUseCase from "./application/use-cases/get-camera.use-case";
import CreateCameraUseCase from "./application/use-cases/create-camera.use-case";
import UpdateCameraUseCase from "./application/use-cases/update-camera.use-case";
import DeleteCameraUseCase from "./application/use-cases/delete-camera.use-case";
import { ICameraRepositoryToken } from "./domain/interfaces/camera-repository.interface";
import CameraRepository from "./infrastructure/repositories/camera.repository";
import { SearchCameraStore } from "./presentation/stores/search-camera-store/search-camera.store";
import { FindCameraStore } from "./presentation/stores/find-camera-store/find-camera.store";
import { GetCameraStore } from "./presentation/stores/get-camera-store/get-camera.store";
import { CreateCameraStore } from "./presentation/stores/create-camera-store/create-camera.store";
import { UpdateCameraStore } from "./presentation/stores/update-camera-store/update-camera.store";
import { DeleteCameraStore } from "./presentation/stores/delete-camera-store/delete-camera.store";

@module({
  providers: [
    {
      provide: ICameraRepositoryToken,
      useClass: CameraRepository,
    },
    SearchCameraUseCase,
    FindCameraUseCase,
    GetCameraUseCase,
    CreateCameraUseCase,
    UpdateCameraUseCase,
    DeleteCameraUseCase,
    {
      useClass: SearchCameraStore,
      scope: "Transient",
    },
    {
      useClass: FindCameraStore,
      scope: "Transient",
    },
    {
      useClass: GetCameraStore,
      scope: "Transient",
    },
    {
      useClass: CreateCameraStore,
      scope: "Transient",
    },
    {
      useClass: UpdateCameraStore,
      scope: "Transient",
    },
    {
      useClass: DeleteCameraStore,
      scope: "Transient",
    },
  ],
})
export class CameraModule {}

export const cameraModuleContainer = getModuleContainer(CameraModule);