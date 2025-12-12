import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "../../constants/theme";
import { useColorScheme } from "../../hooks/useColorScheme";
import { VehicleTypeSelector } from "../../components/VehicleTypeSelector";
import { RiderMap } from "../../components/RiderMap";
import { useAuthStore } from "../../store/authStore";
import { useTripStore } from "../../store/tripStore";
import { apiService } from "../../services/api";
import { Station, VehicleType } from "../../types";

export function RiderDashboardScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const navigation = useNavigation();
  const { userId, clearAuth } = useAuthStore();
  const { setTrip } = useTripStore();

  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [dropDestination, setDropDestination] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.SEDAN_AC);
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const data = await apiService.getStations();
      setStations(data);
      if (data.length > 0) {
        setSelectedStation(data[0].id);
      }
    } catch (error) {
      console.log("Failed to load stations");
    }
  };

  const handleRequestRide = async () => {
    if (!selectedStation || !dropDestination) {
      Alert.alert("Error", "Please select pickup station and enter destination");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.requestRide(
        userId!,
        selectedStation,
        dropDestination,
        arrivalTime.toISOString(),
        vehicleType
      );
      setTrip(response.trip_id);
      navigation.navigate("Waiting" as never);
    } catch (error: any) {
      Alert.alert("Request Failed", "Unable to request ride.");
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
        onPress: () => {
            clearAuth();
        },
      },
    ]);
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setArrivalTime(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* LAYER 1: Map (Background) */}
      <View style={StyleSheet.absoluteFill}>
         <RiderMap />
      </View>

      {/* LAYER 2: Bottom Sheet */}
      {/* REMOVED FLOATING BUTTON. MOVED INSIDE HERE 👇 */}
      <View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: colors.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.xl,
          },
          Shadows.bottomSheet,
        ]}
      >
        <View style={[styles.dragHandle, { backgroundColor: colors.disabled }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
        >
          {/* HEADER ROW: Title + Logout Button */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Request a Ride</Text>
            
            <TouchableOpacity 
                onPress={handleLogout}
                style={styles.inlineLogout}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
                <Feather name="log-out" size={20} color={colors.error} />
                <Text style={{color: colors.error, fontSize: 12, fontWeight: '600'}}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Pickup Station */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Pickup Station</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.backgroundTertiary }]}>
              <Picker
                selectedValue={selectedStation}
                onValueChange={(value) => setSelectedStation(value)}
                style={{ color: colors.text }}
              >
                {stations.map((station) => (
                  <Picker.Item key={station.id} label={station.name} value={station.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Drop Destination */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Drop Destination</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.backgroundTertiary }]}
              placeholder="Enter destination address"
              placeholderTextColor={colors.textSecondary}
              value={dropDestination}
              onChangeText={setDropDestination}
            />
          </View>

          {/* Vehicle Type */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Vehicle Type</Text>
            <VehicleTypeSelector selected={vehicleType} onSelect={setVehicleType} theme="rider" />
          </View>

          {/* Arrival Time */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Arrival Time</Text>
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={[styles.timeButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.backgroundTertiary }]}
            >
              <Feather name="clock" size={20} color={colors.text} />
              <Text style={[styles.timeText, { color: colors.text }]}>
                {arrivalTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </Pressable>
          </View>

          {showTimePicker && (
            <DateTimePicker value={arrivalTime} mode="time" is24Hour={false} onChange={handleTimeChange} />
          )}

          {/* Request Button */}
          <Pressable
            style={({ pressed }) => [
              styles.requestButton,
              { backgroundColor: colors.rider.primary, opacity: pressed || loading ? 0.7 : 1 },
              Shadows.moderate,
            ]}
            onPress={handleRequestRide}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="navigation" size={20} color="#FFFFFF" />
                <Text style={styles.requestButtonText}>Request Ride</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: "85%", // Increased height slightly
    zIndex: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  formContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  // NEW HEADER STYLES
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  inlineLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: '#FEE2E2', // Light red bg
    borderRadius: 8
  },
  formTitle: {
    ...Typography.h3,
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
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
  },
  timeText: {
    ...Typography.body,
  },
  requestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.md,
  },
  requestButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
});