import PayloadDto from "@/core/infrastructure/models/PayloadDto";
import GetCameraPayload from "../../application/interfaces/get-camera-payload.interface";
import { Expose } from "class-transformer";

export default class GetCameraQuery extends PayloadDto<GetCameraPayload> {
  @Expose()
  page!: number;

  @Expose()
  pageSize!: number;

  transform(payload: GetCameraPayload) {
    return {
      page: payload.page,
      pageSize: payload.pageSize,
    };
  }
}