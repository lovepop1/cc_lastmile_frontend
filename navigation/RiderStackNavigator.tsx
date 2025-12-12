import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RiderDashboardScreen } from "../screens/rider/RiderDashboardScreen";
import { WaitingScreen } from "../screens/rider/WaitingScreen";
import { TrackingScreen } from "../screens/rider/TrackingScreen";
import { getCommonScreenOptions } from "./screenOptions";

const Stack = createNativeStackNavigator();

export function RiderStackNavigator() {
  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions}>
      <Stack.Screen
        name="RiderDashboard"
        component={RiderDashboardScreen}
        options={{
          title: "Request Ride",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Waiting"
        component={WaitingScreen}
        options={{
          title: "Finding Driver",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          title: "Ride Details",
          headerTransparent: true,
          headerBackVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
