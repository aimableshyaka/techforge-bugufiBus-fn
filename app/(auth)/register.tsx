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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (phoneNumber.replace(/\D/g, "").length < 10) {
      newErrors.phoneNumber = "Phone number must be at least 10 digits";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const success = await register(fullName, email, phoneNumber, password);
      if (success) {
        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/"),
          },
        ]);
      } else {
        Alert.alert(
          "Registration Failed",
          "Please check your information and try again",
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Registration failed");
    }
  };

  const handleLoginNavigation = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleLoginNavigation} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#F7E8DA" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.brand}>Bugufi Bus</Text>
          <Text style={styles.subtitle}>Create Account</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="account-plus"
            size={48}
            color="#F0B44C"
          />
        </View>

        <Text style={styles.formTitle}>Join Bugufi Bus</Text>
        <Text style={styles.formDescription}>
          Create an account to get started
        </Text>

        <View style={styles.inputsContainer}>
          <InputField
            label="Full Name"
            placeholder="Your full name"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            autoCapitalize="words"
          />

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
            label="Phone Number"
            placeholder="+254 700 000000"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            error={errors.phoneNumber}
          />

          <InputField
            label="Password"
            placeholder="Enter a strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <InputField
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
          />
        </View>

        <PrimaryButton
          label={isLoading ? "Creating Account..." : "Create Account"}
          onPress={handleRegister}
          disabled={isLoading}
          style={styles.registerButton}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={handleLoginNavigation}>
            <Text style={styles.loginLink}>Sign In</Text>
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
    paddingVertical: 24,
    paddingTop: 48,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(247, 232, 218, 0.1)",
    alignItems: "center",
    justifyContent: "center",
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
  registerButton: {
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
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#6A4B3D",
    fontSize: 14,
  },
  loginLink: {
    color: "#F0B44C",
    fontSize: 14,
    fontWeight: "700",
  },
  spacing: {
    height: 32,
  },
});
