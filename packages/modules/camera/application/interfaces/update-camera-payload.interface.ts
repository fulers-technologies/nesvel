export default interface UpdateCameraPayload {
  name?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  ipAddress?: string;
  streamUrl?: string;
}