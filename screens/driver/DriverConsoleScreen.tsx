import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "../../constants/theme";
import { useColorScheme } from "../../hooks/useColorScheme";
import { StatusChip } from "../../components/StatusChip";
import { useAuthStore } from "../../store/authStore";
import { apiService } from "../../services/api";
import { TripSummary, DriverStatus } from "../../types";

// EXACT COORDINATES FOR INDIRANAGAR (Matches the Rider Script Request)
const FIXED_LAT = 12.9784;
const FIXED_LON = 77.6389;

export function DriverConsoleScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const navigation = useNavigation();
  const { userId } = useAuthStore();

  const [status, setStatus] = useState<DriverStatus>(DriverStatus.ONLINE);
  const [passengers, setPassengers] = useState<Array<TripSummary & { riderName?: string }>>([]);
  const [simulateMovement, setSimulateMovement] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ latitude: FIXED_LAT, longitude: FIXED_LON });
  const [loading, setLoading] = useState(false);

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const movementInterval = useRef<NodeJS.Timeout | null>(null);

  // 1. INITIALIZATION (Runs once when screen mounts)
  useEffect(() => {
    if (userId) {
      console.log("🚀 Driver Console Mounted. Initializing...");
      startShift();
    }
    return () => stopAllIntervals();
  }, [userId]);

  // 2. FORCE ALIVE (Runs every time you view the screen)
  useFocusEffect(
    useCallback(() => {
      if (userId) startManifestPolling();
      return () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
      };
    }, [userId])
  );

  const stopAllIntervals = () => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    if (movementInterval.current) clearInterval(movementInterval.current);
  };

  // THE CRITICAL FIX: Sets Status AND Location immediately
  const startShift = async () => {
    try {
      if (!userId) return;

      // A. Set Status
      console.log("📡 Setting Driver ONLINE...");
      await apiService.setDriverStatus(userId, DriverStatus.ONLINE);
      setStatus(DriverStatus.ONLINE);

      // B. Force Location Update (The "I am here" ping)
      // Without this, Redis has no geo-key for this driver, so matches fail.
      console.log(`📍 Pinging Location: ${FIXED_LAT}, ${FIXED_LON}`);
      await apiService.updateDriverLocation(userId, FIXED_LAT, FIXED_LON);
      
      console.log("✅ Driver is now visible to Matcher.");
    } catch (error) {
      console.error("❌ Initialization Failed:", error);
      Alert.alert("Connection Error", "Could not go online. Check backend.");
    }
  };

  const startManifestPolling = () => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    console.log("🔄 Starting Manifest Poll (3s)...");
    pollingInterval.current = setInterval(async () => {
      try {
        if (!userId) return;

        // 1. Fetch Manifest
        const trips = await apiService.getDriverManifest(userId);
        
        // Debug Log: Tell us what the backend sent
        if (trips.length > 0) {
            console.log(`📦 Manifest Update: ${trips.length} passengers found.`);
        }

        // 2. Fetch Names
        const tripsWithNames = await Promise.all(
          trips.map(async (trip) => {
            try {
              // If rider_id is missing, handle gracefully
              if (!trip.rider_id) return { ...trip, riderName: "Unknown Rider" };
              
              const rider = await apiService.getUserProfile(trip.rider_id);
              return { ...trip, riderName: rider.name };
            } catch (err) {
              return { ...trip, riderName: "Rider" };
            }
          })
        );

        setPassengers(tripsWithNames);
        
        // 3. Auto-Sync Status (If driving, update UI)
        const isDriving = trips.some(t => t.status === "IN_PROGRESS");
        if (isDriving && status !== DriverStatus.BUSY) {
            setStatus(DriverStatus.BUSY);
        }

      } catch (error) {
        // console.log("Poll failed...");
      }
    }, 3000);
  };

  // ... (Keep Simulation Logic same as before, it's optional) ...
  const startMovementSimulation = () => {
    if (movementInterval.current) clearInterval(movementInterval.current);
    movementInterval.current = setInterval(async () => {
      try {
        if (!userId) return;
        const newLat = currentLocation.latitude + (Math.random() - 0.5) * 0.0005;
        const newLon = currentLocation.longitude + (Math.random() - 0.5) * 0.0005;
        await apiService.updateDriverLocation(userId, newLat, newLon);
        setCurrentLocation({ latitude: newLat, longitude: newLon });
      } catch (error) {}
    }, 2000);
  };

  useEffect(() => {
    if (simulateMovement) startMovementSimulation();
    else if (movementInterval.current) clearInterval(movementInterval.current);
  }, [simulateMovement]);

  const handleStartRide = async () => {
    setLoading(true);
    try {
      await apiService.setDriverStatus(userId!, DriverStatus.BUSY);
      setStatus(DriverStatus.BUSY);
      Alert.alert("Ride Started", "Status set to BUSY. New matches paused.");
    } catch (error) {
      Alert.alert("Error", "Failed to start");
    } finally {
      setLoading(false);
    }
  };

  const handleDropOff = async (tripId: string, name: string) => {
    try {
        await apiService.completeTrip(tripId);
        // Poll immediately to update UI
        const trips = await apiService.getDriverManifest(userId!);
        // Quick filter locally to feel instant
        setPassengers(prev => prev.filter(p => p.trip_id !== tripId));
        Alert.alert("Dropped Off", `${name} has been dropped.`);
    } catch (e) {
        Alert.alert("Error", "Drop off failed");
    }
  };

  const handleEndShift = async () => {
    try {
        await apiService.setDriverStatus(userId!, DriverStatus.OFFLINE);
        navigation.navigate("RouteSetup" as never); // Adjust if your route name is different (e.g. 'index')
    } catch (e) {}
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot, paddingTop: Spacing.xl, paddingBottom: insets.bottom }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
            <Text style={{color: colors.text, fontWeight: 'bold', fontSize: 18}}>Driver Console</Text>
            <Text style={{color: colors.textSecondary, fontSize: 12}}>
                {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
            </Text>
        </View>
        <StatusChip status={status} />
      </View>

      {/* SIMULATION TOGGLE */}
      <View style={[styles.controls, { borderColor: colors.backgroundTertiary }]}>
          <Text style={{color: colors.text}}>Simulate Driving</Text>
          <Switch value={simulateMovement} onValueChange={setSimulateMovement} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Passengers ({passengers.length})
      </Text>

      {/* PASSENGER LIST */}
      <ScrollView style={{flex: 1}} contentContainerStyle={{gap: 10, paddingBottom: 100}}>
        {passengers.length === 0 ? (
            <View style={styles.emptyState}>
                <Feather name="user-x" size={40} color={colors.textSecondary} />
                <Text style={{color: colors.textSecondary, marginTop: 10}}>Waiting for matches...</Text>
            </View>
        ) : (
            passengers.map(p => (
                <View key={p.trip_id} style={[styles.passengerCard, {backgroundColor: colors.backgroundRoot, borderColor: colors.driver.border}, Shadows.subtle]}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                        <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: colors.driver.surface, alignItems: 'center', justifyContent: 'center'}}>
                            <Feather name="user" size={20} color={colors.driver.primary} />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={{color: colors.text, fontWeight: 'bold'}}>{p.riderName}</Text>
                            <Text style={{color: colors.textSecondary, fontSize: 12}}>{p.drop_destination}</Text>
                        </View>
                        <StatusChip status={p.status} />
                    </View>

                    {/* DROP OFF BUTTON - Only show if Ride Started (BUSY) */}
                    {status === DriverStatus.BUSY && (
                        <Pressable 
                            onPress={() => handleDropOff(p.trip_id, p.riderName || "Rider")}
                            style={{marginTop: 10, backgroundColor: colors.driver.surface, padding: 10, borderRadius: 8, alignItems: 'center'}}
                        >
                            <Text style={{color: colors.driver.primary, fontWeight: 'bold'}}>Drop Off</Text>
                        </Pressable>
                    )}
                </View>
            ))
        )}
      </ScrollView>

      {/* MAIN ACTION BUTTON */}
      <View style={{position: 'absolute', bottom: insets.bottom + 20, left: 20, right: 20}}>
        {passengers.length > 0 && status === DriverStatus.ONLINE ? (
            <Pressable onPress={handleStartRide} style={[styles.bigButton, {backgroundColor: colors.driver.primary}]}>
                <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Start Ride</Text>
            </Pressable>
        ) : passengers.length === 0 ? (
            <Pressable onPress={handleEndShift} style={[styles.bigButton, {backgroundColor: colors.error}]}>
                <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>End Shift</Text>
            </Pressable>
        ) : null}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderWidth: 1, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { ...Typography.h4, marginBottom: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  passengerCard: { padding: 15, borderRadius: 12, borderWidth: 1 },
  bigButton: { height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 }
});