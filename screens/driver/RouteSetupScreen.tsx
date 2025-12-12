import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "../../constants/theme";
import { useColorScheme } from "../../hooks/useColorScheme";
import { ScreenKeyboardAwareScrollView } from "../../components/ScreenKeyboardAwareScrollView";
import { useAuthStore } from "../../store/authStore";
import { apiService } from "../../services/api";
import { Station, VehicleType } from "../../types";
import { getVehicleLabel } from "../../utils/vehicleLabels";

export function RouteSetupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const navigation = useNavigation();
  const { userId, clearAuth } = useAuthStore();

  const [stations, setStations] = useState<Station[]>([]);
  const [targetStation, setTargetStation] = useState<string>("");
  const [stops, setStops] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.SEDAN_AC);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const data = await apiService.getStations();
      setStations(data);
      if (data.length > 0) {
        setTargetStation(data[0].id);
      }
    } catch (error) {
      console.log("Failed to load stations, using fallback");
      setStations([
        { id: "1", name: "Central Station", lat: 12.9716, lon: 77.5946 },
        { id: "2", name: "Airport", lat: 13.1986, lon: 77.7066 },
        { id: "3", name: "Tech Park", lat: 12.9352, lon: 77.6245 },
      ]);
      setTargetStation("1");
    }
  };

  const handleStartShift = async () => {
    if (!targetStation || !stops || !capacity) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const numCapacity = parseInt(capacity);
    if (isNaN(numCapacity) || numCapacity < 1 || numCapacity > 8) {
      Alert.alert("Error", "Capacity must be between 1 and 8");
      return;
    }

    setLoading(true);
    try {
      const stopsList = stops
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await apiService.registerRoute(
        userId!,
        targetStation,
        stopsList,
        numCapacity,
        vehicleType
      );
      navigation.navigate("DriverConsole" as never);
    } catch (error: any) {
      Alert.alert(
        "Failed to Start Shift",
        error.response?.data?.message || "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => clearAuth(),
      },
    ]);
  };

  const vehicleTypes = [
    VehicleType.HATCHBACK,
    VehicleType.SEDAN_AC,
    VehicleType.SUV,
    VehicleType.LUXURY,
    VehicleType.VAN,
    VehicleType.AUTO,
  ];

  return (
    <ScreenKeyboardAwareScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.backgroundRoot },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Setup Your Route</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Configure your shift details
          </Text>
        </View>
        <Pressable onPress={handleLogout} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <Feather name="log-out" size={24} color={colors.error} />
        </Pressable>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Target Station</Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.backgroundTertiary,
              },
            ]}
          >
            <Picker
              selectedValue={targetStation}
              onValueChange={(value: string) => setTargetStation(value)}
              style={{ color: colors.text }}
            >
              {stations.map((station) => (
                <Picker.Item key={station.id} label={station.name} value={station.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Stops (comma-separated)</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.backgroundTertiary,
              },
            ]}
            placeholder="e.g., MG Road, Indiranagar, Whitefield"
            placeholderTextColor={colors.textSecondary}
            value={stops}
            onChangeText={setStops}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Passenger Capacity</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.backgroundTertiary,
              },
            ]}
            placeholder="Enter number (1-8)"
            placeholderTextColor={colors.textSecondary}
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Vehicle Type</Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.backgroundTertiary,
              },
            ]}
          >
            <Picker
              selectedValue={vehicleType}
              onValueChange={(value: VehicleType) => setVehicleType(value)}
              style={{ color: colors.text }}
            >
              {vehicleTypes.map((type) => (
                <Picker.Item
                  key={type}
                  label={getVehicleLabel(type)}
                  value={type}
                />
              ))}
            </Picker>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.driver.primary,
              opacity: pressed || loading ? 0.7 : 1,
            },
            Shadows.moderate,
          ]}
          onPress={handleStartShift}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="play" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Start Shift</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
  },
  subtitle: {
    ...Typography.body,
    marginTop: Spacing.xs,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.small,
    fontWeight: "600",
  },
  pickerContainer: {
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    overflow: "hidden",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    ...Typography.body,
  },
  textArea: {
    minHeight: 80,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    ...Typography.body,
    textAlignVertical: "top",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.sm,
  },
  buttonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
});
