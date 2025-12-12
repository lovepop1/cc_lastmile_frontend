import { create } from "zustand";
import { TripStatus } from "../types";

interface TripState {
  tripId: string | null;
  status: TripStatus | null;
  driverId: string | null;
  setTrip: (tripId: string) => void;
  updateTripStatus: (status: TripStatus, driverId?: string) => void;
  clearTrip: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  tripId: null,
  status: null,
  driverId: null,

  setTrip: (tripId: string) => {
    set({ tripId, status: TripStatus.REQUESTED });
  },

  updateTripStatus: (status: TripStatus, driverId?: string) => {
    set({ status, driverId: driverId || undefined });
  },

  clearTrip: () => {
    set({ tripId: null, status: null, driverId: null });
  },
}));
