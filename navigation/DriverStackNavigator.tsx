import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RouteSetupScreen } from "../screens/driver/RouteSetupScreen";
import { DriverConsoleScreen } from "../screens/driver/DriverConsoleScreen";
import { getCommonScreenOptions } from "./screenOptions";

const Stack = createNativeStackNavigator();

export function DriverStackNavigator() {
  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions}>
      <Stack.Screen
        name="RouteSetup"
        component={RouteSetupScreen}
        options={{
          title: "LastMile Driver",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="DriverConsole"
        component={DriverConsoleScreen}
        options={{
          title: "Active Shift",
          headerBackVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
