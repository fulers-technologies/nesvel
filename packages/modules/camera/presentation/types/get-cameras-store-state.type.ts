import ListState from "@/core/presentation/types/ListState";
import CameraEntity from "../../domain/entities/camera.entity";

type GetCamerasStoreState = ListState<CameraEntity>;

export default GetCamerasStoreState;