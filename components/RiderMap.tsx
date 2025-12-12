import { Platform, View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "../constants/theme";
import { useColorScheme } from "../hooks/useColorScheme";

// Native map - only imported on native platforms
let MapView: any;
if (Platform.OS !== "web") {
  try {
    MapView = require("react-native-maps").default;
  } catch (e) {
    MapView = null;
  }
}

interface RiderMapProps {
  onMapReady?: () => void;
  children?: React.ReactNode;
}

export function RiderMap({ onMapReady, children }: RiderMapProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Web fallback or if MapView not available
  if (Platform.OS === "web" || !MapView) {
    return (
      <View style={[styles.fallback, { backgroundColor: colors.backgroundSecondary }]}>
        <Feather name="map" size={48} color={colors.textSecondary} />
        <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
          Map available on mobile
        </Text>
        <Text style={[styles.fallbackHint, { color: colors.textSecondary }]}>
          Use Expo Go to see the interactive map
        </Text>
        {children}
      </View>
    );
  }

  // Native map
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 12.9716,
        longitude: 77.5946,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
      onMapReady={onMapReady}
      provider="google"
    >
      {children}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  fallbackText: {
    ...Typography.body,
  },
  fallbackHint: {
    ...Typography.small,
  },
});
