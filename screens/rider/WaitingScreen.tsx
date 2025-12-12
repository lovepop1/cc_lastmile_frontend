import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "../../constants/theme";
import { useTripStore } from "../../store/tripStore";
import { useAuthStore } from "../../store/authStore";
import { apiService } from "../../services/api";
import { TripStatus } from "../../types";
import { connectToNotificationStream } from "../../services/eventSource";

export function WaitingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const { tripId, updateTripStatus, clearTrip } = useTripStore();
  const { userId } = useAuthStore();
  
  const [cancelling, setCancelling] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false); // <--- NEW MODAL STATE
  
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const closeEventSource = useRef<(() => void) | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    let mounted = true;

    if (userId && tripId) {
      console.log("[Waiting] Connecting to stream...");
      closeEventSource.current = connectToNotificationStream(
        userId,
        (message) => {
          if (!mounted || isProcessing.current) return;
          if (message.includes("MATCH")) {
            console.log("[Waiting] Stream received MATCH!");
            handleMatchFound();
          }
        },
        (error) => {
          console.log("[Waiting] Stream error, relying on polling");
        }
      );
    }

    startPolling();

    return () => {
      mounted = false;
      stopAllListeners();
    };
  }, [userId, tripId]);

  const stopAllListeners = () => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    if (closeEventSource.current) closeEventSource.current();
  };

  const handleMatchFound = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    stopAllListeners();

    try {
      const status = await apiService.getTripStatus(tripId!);
      updateTripStatus(status.status, status.driver_id);

      // SHOW THE NEW MODAL INSTEAD OF TOAST
      setShowMatchModal(true);

      // Navigate after 2 seconds so user sees the success message
      setTimeout(() => {
        setShowMatchModal(false);
        navigation.navigate("Tracking" as never);
      }, 2000);

    } catch (error) {
      console.error("Error fetching trip status:", error);
      isProcessing.current = false;
    }
  };

  const startPolling = () => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    pollingInterval.current = setInterval(async () => {
      if (isProcessing.current || !tripId) return;

      try {
        const status = await apiService.getTripStatus(tripId);
        if (status.status === TripStatus.MATCHED) {
          handleMatchFound();
        } 
        else if (status.status === TripStatus.CANCELLED) {
          isProcessing.current = true;
          stopAllListeners();
          Alert.alert("Request Cancelled", "Your ride request was cancelled by the system.");
          await clearTrip();
          navigation.navigate("RiderDashboard" as never);
        }
      } catch (error) {
        // Silent fail for polling
      }
    }, 3000);
  };

  const confirmCancel = async () => {
    if (!tripId) return;
    isProcessing.current = true;
    setCancelling(true);
    stopAllListeners();

    try {
      await apiService.cancelRide(tripId);
      await clearTrip();
      navigation.reset({ index: 0, routes: [{ name: 'RiderDashboard' }] });
    } catch (error: any) {
      Alert.alert("Error", "Failed to cancel ride.");
      isProcessing.current = false; 
      setCancelling(false);
      startPolling(); 
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing["4xl"] }]}>
      
      {/* MAIN WAITING UI */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.pulseOuter, { backgroundColor: `${Colors.light.rider.primary}30` }]} />
          <View style={[styles.pulseMiddle, { backgroundColor: `${Colors.light.rider.primary}50` }]} />
          <View style={[styles.iconCircle, { backgroundColor: Colors.light.rider.primary }]}>
            <Feather name="search" size={32} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Searching for nearby drivers...</Text>
        <Text style={styles.subtitle}>This may take a moment</Text>
        <ActivityIndicator size="large" color={Colors.light.rider.primary} style={styles.loader} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.8 : 1 }]}
        onPress={() => Alert.alert("Cancel", "Cancel this request?", [{ text: "No" }, { text: "Yes", onPress: confirmCancel }])}
        disabled={cancelling}
      >
        {cancelling ? <ActivityIndicator color="white" /> : (
            <>
                <Feather name="x" size={20} color="#FFFFFF" />
                <Text style={styles.cancelButtonText}>Cancel Request</Text>
            </>
        )}
      </Pressable>

      {/* --- NEW SUCCESS MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showMatchModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Feather name="check" size={50} color="white" />
            </View>
            <Text style={styles.modalTitle}>Driver Found!</Text>
            <Text style={styles.modalText}>Your ride is confirmed.</Text>
            <Text style={styles.modalSubText}>Redirecting to tracker...</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 40 },
  content: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 20 },
  iconContainer: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  pulseOuter: { position: 'absolute', width: 120, height: 120, borderRadius: 60 },
  pulseMiddle: { position: 'absolute', width: 80, height: 80, borderRadius: 40 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  loader: { marginTop: 20 },
  cancelButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EF4444', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '80%', justifyContent: 'center' },
  cancelButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 24, padding: 40, alignItems: 'center', elevation: 10 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  modalText: { fontSize: 18, color: '#374151', marginBottom: 20 },
  modalSubText: { fontSize: 14, color: '#9CA3AF' }
});