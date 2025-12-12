import { Platform } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export const getCommonScreenOptions: NativeStackNavigationOptions = {
  headerTitleAlign: "center",
  headerTransparent: false,
  gestureEnabled: true,
  gestureDirection: "horizontal",
};
