export enum UserRole {
  RIDER = "RIDER",
  DRIVER = "DRIVER",
}

export enum TripStatus {
  REQUESTED = "REQUESTED",
  MATCHED = "MATCHED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum VehicleType {
  HATCHBACK = 1,
  SEDAN_AC = 2,
  SUV = 3,
  LUXURY = 4,
  VAN = 5,
  AUTO = 6,
}

export enum DriverStatus {
  ONLINE = "ONLINE",
  BUSY = "BUSY",
  OFFLINE = "OFFLINE",
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface TripSummary {
  trip_id: string;
  rider_id: string;
  drop_destination: string;
  status: TripStatus;
}

export interface AuthResponse {
  token: string;
  user_id: string;
  role: UserRole;
}

export interface TripStatusResponse {
  trip_id: string;
  status: TripStatus;
  driver_id?: string;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
}
