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
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { InputField } from "../../src/components/input";
import { PrimaryButton } from "../../src/components/buttons";
import { AuthContext } from "../../src/context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const success = await login(email, password);
      if (success) {
        router.replace("/");
      } else {
        Alert.alert("Login Failed", "Invalid email or password");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Login failed");
    }
  };

  const handleRegisterNavigation = () => {
    router.push("/(auth)/register");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.brand}>Bugufi Bus</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="login" size={48} color="#F0B44C" />
        </View>

        <Text style={styles.formTitle}>Login to Your Account</Text>
        <Text style={styles.formDescription}>
          Enter your credentials to continue
        </Text>

        <View style={styles.inputsContainer}>
          <InputField
            label="Email"
            placeholder="your-email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
            autoCapitalize="none"
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />
        </View>

        <Pressable style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
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

        <View style={styles.registerSection}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <Pressable onPress={handleRegisterNavigation}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#7B4A35",
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: 48,
  },
  headerContent: {
    gap: 8,
  },
  brand: {
    color: "#F7E8DA",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#E7D6C9",
    fontSize: 14,
    fontWeight: "500",
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  formTitle: {
    color: "#2C1810",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  formDescription: {
    color: "#6A4B3D",
    fontSize: 14,
    textAlign: "center",
  },
  inputsContainer: {
    gap: 20,
  },
  forgotPassword: {
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    color: "#F0B44C",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    marginVertical: 8,
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
    backgroundColor: "#D9CCC4",
  },
  dividerText: {
    color: "#A89080",
    fontSize: 12,
    fontWeight: "500",
  },
  registerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: "#6A4B3D",
    fontSize: 14,
  },
  registerLink: {
    color: "#F0B44C",
    fontSize: 14,
    fontWeight: "700",
  },
  spacing: {
    height: 32,
  },
});
