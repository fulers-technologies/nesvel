export default interface CreateCameraPayload {
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  ipAddress: string;
  streamUrl: string;
}