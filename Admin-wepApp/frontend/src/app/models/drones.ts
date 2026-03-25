export interface Drone {
  id: string;
  name: string;
  model: string;
  status: string;
  battery: number;
  location: string;
  lastFlight: string;
  totalFlights: number;
  registered_by: string;
  maxPayload: string;
}