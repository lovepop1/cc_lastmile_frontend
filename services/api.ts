import axios, { AxiosInstance } from "axios";
import { API_URL } from "../config";
import {
  AuthResponse,
  User,
  Station,
  TripSummary,
  TripStatusResponse,
  DriverLocation,
  UserRole,
  DriverStatus,
  VehicleType,
} from "../types";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    console.log(`🔌 Initializing API Service at: ${API_URL}`);
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  setAuthToken(token: string) {
    if (!token) return;
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common["Authorization"];
  }

  // --- AUTHENTICATION ---

  async login(email: string, password: string): Promise<AuthResponse> {
    console.log(`🔑 Logging in as: ${email}`);
    const response = await this.client.post("/auth/login", {
      email,
      password,
    });
    
    console.log("📥 Login Response:", JSON.stringify(response.data));

    if (!response.data.token) {
      throw new Error("Login failed: No token received");
    }

    // --- FIX: Convert Backend Enum (Int) to Frontend Enum (String) ---
    // Backend: 1 = RIDER, 2 = DRIVER
    let roleStr = UserRole.RIDER; // Default
    const backendRole = response.data.role;

    if (backendRole === 1 || backendRole === "RIDER") {
        roleStr = UserRole.RIDER;
    } else if (backendRole === 2 || backendRole === "DRIVER") {
        roleStr = UserRole.DRIVER;
    }
    // -----------------------------------------------------------------

    return {
        ...response.data,
        role: roleStr // Now it is a String ("RIDER"), not a Number (1)
    };
  }

  async register(
    name: string,
    email: string,
    password: string,
    phone: string,
    role: UserRole
  ): Promise<{ success: boolean; user_id: string }> {
    console.log(`📝 Registering user: ${email} as ${role}`);
    
    const response = await this.client.post("/auth/register", {
      name,
      email,
      password,
      phone,
      role: role.toUpperCase(), // Ensure Uppercase for Backend Enum
    });

    console.log("📥 Register Response:", JSON.stringify(response.data));

    // CHECK 2: Did the backend say success: false?
    if (response.data.success === false) {
      console.error("❌ Registration Logic Failed (Backend sent 200 OK but success=false)");
      throw new Error("Registration Failed: User may already exist.");
    }

    return response.data;
  }

  // --- DATA ---

  async getStations(): Promise<Station[]> {
    const response = await this.client.get("/stations");
    return response.data;
  }

  async getUserProfile(userId: string): Promise<User> {
    const response = await this.client.get(`/user/${userId}`);
    return response.data;
  }

  // --- DRIVER ---

  async registerRoute(
    driverId: string,
    targetStationId: string,
    stops: string[],
    totalSeats: number,
    vehicleType: VehicleType
  ): Promise<void> {
    const response = await this.client.post("/driver/route", {
      driver_id: driverId,
      target_station_id: targetStationId,
      stops,
      total_seats: totalSeats,
      vehicle_type: vehicleType,
    });
    if (response.data.success === false) throw new Error(response.data.message || "Failed to register route");
  }

  async updateDriverLocation(driverId: string, lat: number, lon: number): Promise<void> {
    await this.client.post("/driver/location", {
      driver_id: driverId,
      latitude: lat,
      longitude: lon,
    });
  }

  async setDriverStatus(driverId: string, status: DriverStatus): Promise<void> {
    await this.client.post("/driver/status", {
      driver_id: driverId,
      status,
    });
  }

  async getDriverManifest(driverId: string): Promise<TripSummary[]> {
    const response = await this.client.get(`/driver/${driverId}/trips`);
    return response.data;
  }

  // --- RIDER ---

  async requestRide(
    riderId: string,
    pickupStationId: string,
    dropDestination: string,
    arrivalTime: string,
    requestedVehicleType: VehicleType
  ): Promise<{ trip_id: string }> {
    const response = await this.client.post("/ride/request", {
      rider_id: riderId,
      pickup_station_id: pickupStationId,
      drop_destination: dropDestination,
      arrival_time: arrivalTime,
      requested_vehicle_type: requestedVehicleType,
    });
    return response.data;
  }

  async getTripStatus(tripId: string): Promise<TripStatusResponse> {
    const response = await this.client.get(`/ride/${tripId}/status`);
    return response.data;
  }

  async cancelRide(tripId: string): Promise<void> {
    await this.client.post(`/ride/${tripId}/cancel`, {});
  }

  async trackDriver(driverId: string): Promise<DriverLocation> {
    const response = await this.client.get(`/driver/${driverId}/location`);
    return response.data;
  }

  async completeTrip(tripId: string): Promise<void> {
    await this.client.post(`/trip/${tripId}/complete`, {});
  }
}

export const apiService = new ApiService();