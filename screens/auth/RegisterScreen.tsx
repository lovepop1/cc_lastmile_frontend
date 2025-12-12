import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "../../constants/theme";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useAuthStore } from "../../store/authStore";
import { apiService } from "../../services/api";
import { UserRole } from "../../types";
import { ScreenKeyboardAwareScrollView } from "../../components/ScreenKeyboardAwareScrollView";

export function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const navigation = useNavigation();
  const { setAuth } = useAuthStore();

  const [role, setRole] = useState<UserRole>(UserRole.RIDER);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.register(name, email, password, phone, role);
      const loginResponse = await apiService.login(email, password);
      await setAuth(loginResponse.token, loginResponse.user_id, loginResponse.role);
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  const themeColors = role === UserRole.RIDER ? colors.rider : colors.driver;

  return (
    <ScreenKeyboardAwareScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.backgroundRoot },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>

      <View style={styles.roleSelector}>
        <Pressable
          onPress={() => setRole(UserRole.RIDER)}
          style={({ pressed }) => [
            styles.roleButton,
            {
              backgroundColor:
                role === UserRole.RIDER
                  ? colors.rider.primary
                  : colors.backgroundSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather
            name="user"
            size={20}
            color={role === UserRole.RIDER ? "#FFFFFF" : colors.text}
          />
          <Text
            style={[
              styles.roleText,
              {
                color: role === UserRole.RIDER ? "#FFFFFF" : colors.text,
              },
            ]}
          >
            Rider
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setRole(UserRole.DRIVER)}
          style={({ pressed }) => [
            styles.roleButton,
            {
              backgroundColor:
                role === UserRole.DRIVER
                  ? colors.driver.primary
                  : colors.backgroundSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather
            name="truck"
            size={20}
            color={role === UserRole.DRIVER ? "#FFFFFF" : colors.text}
          />
          <Text
            style={[
              styles.roleText,
              {
                color: role === UserRole.DRIVER ? "#FFFFFF" : colors.text,
              },
            ]}
          >
            Driver
          </Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.backgroundTertiary,
              },
            ]}
            placeholder="Enter your name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.backgroundTertiary,
              },
            ]}
            placeholder="Enter your email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.backgroundTertiary,
              },
            ]}
            placeholder="Enter your phone number"
            placeholderTextColor={colors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderColor: colors.backgroundTertiary,
                },
              ]}
              placeholder="Create a password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Confirm Password
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.backgroundTertiary,
              },
            ]}
            placeholder="Confirm your password"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: themeColors.primary,
              opacity: pressed ? 0.7 : 1,
            },
            Shadows.moderate,
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
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
  title: {
    ...Typography.h2,
    marginBottom: Spacing.xl,
  },
  roleSelector: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xs,
  },
  roleText: {
    ...Typography.body,
    fontWeight: "600",
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
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    ...Typography.body,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: Spacing["5xl"],
  },
  eyeIcon: {
    position: "absolute",
    right: Spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  buttonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
});
