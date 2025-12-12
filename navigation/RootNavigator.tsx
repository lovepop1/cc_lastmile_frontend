import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";
import { UserRole } from "../types";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { RiderStackNavigator } from "./RiderStackNavigator";
import { DriverStackNavigator } from "./DriverStackNavigator";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useEffect } from "react";
import { Colors } from "../constants/theme";
import { useColorScheme } from "../hooks/useColorScheme";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { token, role, isLoading, loadAuth } = useAuthStore();
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme].rider.primary}
        />
      </View>
    );
  }

  if (!token) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  if (role === UserRole.RIDER) {
    return <RiderStackNavigator />;
  }

  if (role === UserRole.DRIVER) {
    return <DriverStackNavigator />;
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
