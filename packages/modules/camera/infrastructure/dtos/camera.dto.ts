import { Expose } from "class-transformer";
import ResponseDto from "@/core/infrastructure/models/ResponseDto";
import CameraEntity from "../../domain/entities/camera.entity";

export default class CameraDto extends ResponseDto<CameraEntity> {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  location!: string;

  @Expose()
  status!: 'active' | 'inactive' | 'maintenance';

  @Expose()
  ipAddress!: string;

  @Expose()
  streamUrl!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  toDomain() {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      status: this.status,
      ipAddress: this.ipAddress,
      streamUrl: this.streamUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}