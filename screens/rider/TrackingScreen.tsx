import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "../../constants/theme";
import { StatusChip } from "../../components/StatusChip";
import { DriverLocationMap } from "../../components/DriverLocationMap";
import { useTripStore } from "../../store/tripStore";
import { apiService } from "../../services/api";
import { TripStatus, User } from "../../types";

export function TrackingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const { tripId, driverId, clearTrip } = useTripStore();
  
  const [driver, setDriver] = useState<User | null>(null);
  const [driverLocation, setDriverLocation] = useState({ latitude: 12.9716, longitude: 77.5946 });
  const [currentStatus, setCurrentStatus] = useState<string>("INITIALIZING");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (driverId) {
      loadDriverInfo();
      startLocationPolling();
    }
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [driverId, tripId]);

  const loadDriverInfo = async () => {
    try {
      if (!driverId) return;
      const info = await apiService.getUserProfile(driverId);
      setDriver(info);
    } catch (error) {
      console.error("Failed to load driver info:", error);
    }
  };

  const startLocationPolling = () => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    
    pollingInterval.current = setInterval(async () => {
      try {
        if (!driverId || !tripId) return;

        const [location, tripResponse] = await Promise.all([
          apiService.trackDriver(driverId).catch(() => null),
          apiService.getTripStatus(tripId),
        ]);

        if (location && typeof location.latitude === 'number') {
            setDriverLocation({
                latitude: location.latitude,
                longitude: location.longitude,
            });
        }

        setCurrentStatus(tripResponse.status);

        if (tripResponse.status === "COMPLETED" && !showSuccessModal) {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
            setShowSuccessModal(true);
        }
      } catch (error) {
        console.error("Polling failed:", error);
      }
    }, 2000);
  };

  const handleFinish = async () => {
      await clearTrip();
      navigation.navigate("RiderDashboard" as never);
  };

  return (
    <View style={styles.container}>
      
      {/* LAYER 1: MAP (No Children allowed to prevent Crash) */}
      <View style={StyleSheet.absoluteFillObject}>
        <DriverLocationMap
            latitude={driverLocation.latitude}
            longitude={driverLocation.longitude}
        />
      </View>

      {/* LAYER 2: DEBUG OVERLAY (Must be Sibling) */}
      <View style={styles.debugOverlay}>
          <Text style={styles.debugText}>STATUS: {currentStatus}</Text>
      </View>

      {/* LAYER 3: BOTTOM CARD */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.dragHandle} />
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.driverInfo}>
              <View style={styles.avatar}>
                <Feather name="user" size={24} color={Colors.light.rider.primary} />
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{driver?.name || "Driver"}</Text>
                <Text style={styles.driverPhone}>{driver?.phone || "..."}</Text>
              </View>
            </View>
            <StatusChip status={currentStatus as TripStatus} />
          </View>
          <Text style={styles.statusMessage}>
             {currentStatus === "IN_PROGRESS" ? "Trip in progress..." : "Driver is arriving"}
          </Text>
        </View>
      </View>

      {/* LAYER 4: SUCCESS MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
                <Feather name="check" size={40} color="white" />
            </View>
            
            <Text style={styles.modalTitle}>You have arrived!</Text>
            <Text style={styles.modalText}>
                Your ride has been completed. Thank you for using LastMile.
            </Text>

            <Pressable style={styles.finishButton} onPress={handleFinish}>
                <Text style={styles.finishButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Debug Overlay Position
  debugOverlay: { 
    position: 'absolute', 
    top: 100, 
    alignSelf: 'center', 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    padding: 8, 
    borderRadius: 8,
    zIndex: 5 // Important
  },
  debugText: { color: 'white', fontWeight: 'bold' },

  bottomCard: { 
    position: "absolute", bottom: 0, left: 0, right: 0, 
    backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10
  },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: "center", marginTop: 12, marginBottom: 20 },
  cardContent: { paddingHorizontal: 24, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  driverInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DCFCE7', justifyContent: "center", alignItems: "center" },
  driverDetails: { gap: 4 },
  driverName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  driverPhone: { fontSize: 14, color: '#64748B' },
  statusMessage: { fontSize: 16, color: '#64748B' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 24, padding: 30, alignItems: 'center', elevation: 5 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  modalText: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 30 },
  finishButton: { width: '100%', height: 50, backgroundColor: '#10B981', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  finishButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});