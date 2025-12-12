import { Platform, View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "../constants/theme";
import { useColorScheme } from "../hooks/useColorScheme";

// Native map - only imported on native platforms
let MapView: any;
let Marker: any;
if (Platform.OS !== "web") {
  try {
    const Maps = require("react-native-maps");
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (e) {
    MapView = null;
    Marker = null;
  }
}

interface DriverLocationMapProps {
  latitude: number;
  longitude: number;
  onMapReady?: () => void;
  children?: React.ReactNode;
}

export function DriverLocationMap({
  latitude,
  longitude,
  onMapReady,
  children,
}: DriverLocationMapProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Web fallback or if MapView not available
  if (Platform.OS === "web" || !MapView || !Marker) {
    return (
      <View style={[styles.fallback, { backgroundColor: colors.backgroundSecondary }]}>
        <Feather name="map" size={48} color={colors.textSecondary} />
        <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
          Driver Location Map
        </Text>
        <Text style={[styles.fallbackCoords, { color: colors.textSecondary }]}>
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        <Text style={[styles.fallbackHint, { color: colors.textSecondary }]}>
          View on mobile with Expo Go
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
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onMapReady={onMapReady}
      provider="google"
    >
      <Marker coordinate={{ latitude, longitude }} title="Driver Location" />
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
    fontWeight: "600",
  },
  fallbackCoords: {
    ...Typography.caption,
    fontFamily: "monospace",
  },
  fallbackHint: {
    ...Typography.small,
  },
});
