export default interface CameraEntity {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  ipAddress: string;
  streamUrl: string;
  createdAt: Date;
  updatedAt: Date;
}