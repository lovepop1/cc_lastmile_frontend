import { ScrollView, Pressable, Text, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { VehicleType } from "../types";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "../constants/theme";
import { useColorScheme } from "../hooks/useColorScheme";

interface VehicleTypeSelectorProps {
  selected: VehicleType;
  onSelect: (type: VehicleType) => void;
  theme?: "rider" | "driver";
}

const vehicleTypes = [
  { type: VehicleType.HATCHBACK, label: "Hatchback", icon: "" },
  { type: VehicleType.SEDAN_AC, label: "Sedan", icon: "" },
  { type: VehicleType.SUV, label: "SUV", icon: "" },
  { type: VehicleType.LUXURY, label: "Luxury", icon: "" },
  { type: VehicleType.VAN, label: "Van", icon: "" },
  { type: VehicleType.AUTO, label: "Auto", icon: "" },
];

export function VehicleTypeSelector({
  selected,
  onSelect,
  theme = "rider",
}: VehicleTypeSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const themeColors = colors[theme];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {vehicleTypes.map((vehicle) => {
        const isSelected = selected === vehicle.type;
        return (
          <Pressable
            key={vehicle.type}
            onPress={() => onSelect(vehicle.type)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isSelected
                  ? themeColors.primary
                  : colors.backgroundSecondary,
                borderColor: isSelected ? themeColors.primary : colors.backgroundTertiary,
                opacity: pressed ? 0.7 : 1,
              },
              isSelected && Shadows.subtle,
            ]}
          >
            <Feather
              name={vehicle.icon as any}
              size={20}
              color={isSelected ? "#FFFFFF" : colors.text}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? "#FFFFFF" : colors.text,
                },
              ]}
            >
              {vehicle.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  label: {
    ...Typography.small,
    fontWeight: "600",
  },
});
