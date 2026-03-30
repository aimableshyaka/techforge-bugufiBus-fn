import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "../src/components/buttons";
import { InputField } from "../src/components/input";
import { AuthContext } from "../src/context/AuthContext";

export default function DriverScreen() {
  const router = useRouter();
  const { login, isLoading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Email validation helper
  const isValidEmail = (value: string): boolean => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$|^(\+?\d{1,3}[-.\s]?)?\d{1,14}$/;
    return emailRegex.test(value.trim());
  };

  // Password validation helper
  const isValidPassword = (value: string): boolean => {
    return value.trim().length >= 6;
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email or phone number is required");
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email or phone number");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (!isValidPassword(password)) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        router.replace("/driver-dashboard");
      } else {
        Alert.alert("Login Failed", "Invalid email or password");
      }
    } catch (error) {
      Alert.alert("Error", "Login failed. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "Enter your email to receive password reset instructions.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Send",
          onPress: () => {
            Alert.alert(
              "Success",
              "If an account exists, a reset link will be sent to your email.",
            );
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Driver Login</Text>
        <Text style={styles.subtitle}>
          Sign in to manage your bus schedule and track your route
        </Text>
      </View>

      <View style={styles.form}>
        <InputField
          label="Email or Phone"
          placeholder="example@email.com or +1234567890"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={emailError}
          autoCapitalize="none"
        />

        <InputField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={passwordError}
        />

        <Pressable onPress={handleForgotPassword}>
          <Text style={styles.forgotLink}>Forgot Password?</Text>
        </Pressable>

        <PrimaryButton
          label={isLoading ? "Logging in..." : "Login"}
          onPress={handleLogin}
          disabled={isLoading}
          style={styles.loginButton}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Pressable>
            <Text style={styles.signupLink}>Sign up as Driver</Text>
          </Pressable>
        </View> */}
      </View>

      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7B4A35",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
    gap: 8,
  },
  title: {
    color: "#F7E8DA",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#E7D6C9",
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  forgotLink: {
    color: "#F0B44C",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  loginButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#6C3F2C",
  },
  dividerText: {
    color: "#A89080",
    fontSize: 12,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  signupText: {
    color: "#E7D6C9",
    fontSize: 14,
  },
  signupLink: {
    color: "#F0B44C",
    fontSize: 14,
    fontWeight: "700",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#E7D6C9",
    fontSize: 14,
    fontWeight: "600",
  },
});
