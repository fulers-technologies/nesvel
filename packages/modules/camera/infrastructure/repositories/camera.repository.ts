import SearchCameraPayload from "../../application/interfaces/search-camera-payload.interface";
import GetCameraPayload from "../../application/interfaces/get-camera-payload.interface";
import CreateCameraPayload from "../../application/interfaces/create-camera-payload.interface";
import UpdateCameraPayload from "../../application/interfaces/update-camera-payload.interface";
import { injectable, inject } from "inversiland";
import { ICameraRepository } from "../../domain/interfaces/camera-repository.interface";
import SearchCameraResponse from "../../application/interfaces/search-camera-response.interface";
import GetCameraResponse from "../../application/interfaces/get-camera-response.interface";
import CameraDto from "../dtos/camera.dto";
import { plainToInstance } from "class-transformer";
import IHttpClient, {
  IHttpClientToken,
} from "@/core/domain/specifications/IHttpClient";

@injectable()
class CameraRepository implements ICameraRepository {
  private readonly baseUrl = "/cameras";

  constructor(
    @inject(IHttpClientToken) private readonly httpClient: IHttpClient
  ) {}

  public async search({
    query,
  }: SearchCameraPayload): Promise<SearchCameraResponse> {
    const cameras = await this.httpClient.get<unknown[]>(
      `${this.baseUrl}?q=${query}`
    );
    const response: SearchCameraResponse = {
      results: cameras.map((camera) =>
        plainToInstance(CameraDto, camera).toDomain()
      ),
      count: cameras.length,
    };

    return response;
  }

  public async find(id: number) {
    const response = await this.httpClient.get(`${this.baseUrl}/${id}`);
    const responseDto = plainToInstance(CameraDto, response);

    return responseDto.toDomain();
  }

  public async get({}: GetCameraPayload): Promise<GetCameraResponse> {
    const cameras = await this.httpClient.get<unknown[]>(this.baseUrl);
    const response: GetCameraResponse = {
      results: cameras.map((camera) =>
        plainToInstance(CameraDto, camera).toDomain()
      ),
      count: cameras.length,
    };

    return response;
  }

  public async create(data: CreateCameraPayload) {
    const response = await this.httpClient.post(this.baseUrl, data);
    const responseDto = plainToInstance(CameraDto, response);

    return responseDto.toDomain();
  }

  public async update(id: number, data: UpdateCameraPayload) {
    const response = await this.httpClient.patch(
      `${this.baseUrl}/${id}`,
      data
    );
    const responseDto = plainToInstance(CameraDto, response);

    return responseDto.toDomain();
  }

  public async delete(id: number): Promise<void> {
    await this.httpClient.delete(`${this.baseUrl}/${id}`);
  }
}

export default CameraRepository;