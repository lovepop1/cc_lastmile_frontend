import { Platform, View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "../hooks/useColorScheme";
import { Colors, Typography, Spacing } from "../constants/theme";

interface MapFallbackProps {
  children?: React.ReactNode;
}

export function MapFallback({ children }: MapFallbackProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.mapFallback, { backgroundColor: colors.backgroundSecondary }]}>
      <Feather name="map" size={48} color={colors.textSecondary} />
      <Text style={[styles.mapFallbackText, { color: colors.textSecondary }]}>
        Map unavailable on web
      </Text>
      <Text style={[styles.mapHint, { color: colors.textSecondary }]}>
        Use Expo Go on mobile to see the map
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  mapFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  mapFallbackText: {
    ...Typography.body,
  },
  mapHint: {
    ...Typography.small,
  },
});

export const isMapAvailable = Platform.OS !== "web";
