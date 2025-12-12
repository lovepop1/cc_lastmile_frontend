import { VehicleType } from "../types";

export function getVehicleLabel(type: VehicleType): string {
  switch (type) {
    case VehicleType.HATCHBACK:
      return "Hatchback";
    case VehicleType.SEDAN_AC:
      return "Sedan AC";
    case VehicleType.SUV:
      return "SUV";
    case VehicleType.LUXURY:
      return "Luxury";
    case VehicleType.VAN:
      return "Van";
    case VehicleType.AUTO:
      return "Auto";
    default:
      return "Unknown";
  }
}
