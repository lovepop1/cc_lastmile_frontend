import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, Typography } from "../constants/theme";
import { useColorScheme } from "../hooks/useColorScheme";
import { TripStatus, DriverStatus } from "../types";

interface StatusChipProps {
  status: TripStatus | DriverStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const getStatusColor = () => {
    switch (status) {
      case TripStatus.REQUESTED:
        return colors.warning;
      case TripStatus.MATCHED:
      case DriverStatus.ONLINE:
        return colors.status.matched;
      case TripStatus.IN_PROGRESS:
      case DriverStatus.BUSY:
        return colors.status.inProgress;
      case TripStatus.COMPLETED:
        return colors.status.completed;
      case TripStatus.CANCELLED:
        return colors.error;
      case DriverStatus.OFFLINE:
        return colors.status.offline;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case TripStatus.REQUESTED:
        return "Requested";
      case TripStatus.MATCHED:
        return "Matched";
      case TripStatus.IN_PROGRESS:
        return "In Progress";
      case TripStatus.COMPLETED:
        return "Completed";
      case TripStatus.CANCELLED:
        return "Cancelled";
      case DriverStatus.ONLINE:
        return "Online";
      case DriverStatus.BUSY:
        return "Busy";
      case DriverStatus.OFFLINE:
        return "Offline";
      default:
        return status;
    }
  };

  const color = getStatusColor();

  return (
    <View style={[styles.container, { backgroundColor: `${color}20` }]}>
      <Text style={[styles.text, { color }]}>{getStatusLabel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    ...Typography.caption,
    fontWeight: "600",
  },
});
