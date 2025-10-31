import ListState from "@/core/presentation/types/ListState";
import CameraEntity from "../../domain/entities/camera.entity";

export default interface GetCameraStoreState extends ListState<CameraEntity> {}