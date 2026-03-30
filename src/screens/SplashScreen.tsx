import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "../components/buttons";
import SplashHeader from "../components/header";
import { LocationContext } from "../context/LocationContext";

export default function SplashScreen() {
  const router = useRouter();
  const locationCtx = useContext(LocationContext);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleGetStarted = () => {
    setShowLocationPrompt(true);
  };

  const handleAllowLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Store location in context
        locationCtx.setLocation(location);
        locationCtx.setIsLocationGranted(true);

        console.log("Location granted:", location);

        setShowLocationPrompt(false);
        setShowRoleSelect(true);
      } else {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to find nearby buses.",
          [{ text: "OK" }],
        );
        setIsLoadingLocation(false);
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get location. Please try again.");
      setIsLoadingLocation(false);
    }
  };

  const handleSkipLocation = () => {
    setShowLocationPrompt(false);
    setShowRoleSelect(true);
  };

  const handleUserRole = () => {
    router.push("/user");
  };

  const handleDriverRole = () => {
    router.push("/driver");
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.brand}>Bugufi Bus</Text>
        <View style={styles.heroArea}>
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <Image
              source={require("../../assets/images/splash-icon.png")}
              style={styles.heroImage}
              resizeMode="contain"
            />
            <Text style={styles.heroTag}>Ride Ready</Text>
          </View>
        </View>

        <SplashHeader
          title="Choose Your Bus, Track It Live"
          subtitle="See the nearest bus arrival, distance, and live movement all in one place."
        />

        {showRoleSelect ? (
          <View style={styles.roleGroup}>
            <Text style={styles.roleTitle}>Continue as</Text>
            <PrimaryButton label="Normal User" onPress={handleUserRole} />
            <PrimaryButton
              label="Driver"
              onPress={handleDriverRole}
              style={styles.roleButtonAlt}
            />
          </View>
        ) : (
          <PrimaryButton label="Get Started" onPress={handleGetStarted} />
        )}

        <View style={styles.beanRow}>
          <View style={[styles.bean, styles.beanSoft]} />
          <View style={styles.bean} />
          <View style={[styles.bean, styles.beanLight]} />
        </View>
      </View>
      <Modal transparent visible={showLocationPrompt} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enable Location</Text>
            <Text style={styles.modalText}>
              Turn on location to find nearby buses and live arrival times.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={handleSkipLocation}
                disabled={isLoadingLocation}
              >
                <Text style={styles.modalLink}>Not now</Text>
              </Pressable>
              <PrimaryButton
                label={isLoadingLocation ? "Requesting..." : "Allow"}
                onPress={handleAllowLocation}
                disabled={isLoadingLocation}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7B4A35",
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 48,
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    color: "#F7E8DA",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroArea: {
    width: "100%",
    alignItems: "center",
  },
  heroCard: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#5E3627",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  heroGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#87523C",
    opacity: 0.9,
  },
  heroImage: {
    width: 120,
    height: 120,
    tintColor: "#F0B44C",
  },
  heroTag: {
    marginTop: 8,
    color: "#F7E8DA",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  beanRow: {
    flexDirection: "row",
    gap: 10,
  },
  bean: {
    width: 18,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#5E3627",
  },
  beanSoft: {
    backgroundColor: "#6C3F2C",
  },
  beanLight: {
    backgroundColor: "#8E5A44",
  },
  roleGroup: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  roleTitle: {
    color: "#F7E8DA",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  roleButtonAlt: {
    backgroundColor: "#F7D39A",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(24, 14, 10, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#F7E8DA",
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    color: "#4A2E22",
    fontSize: 18,
    fontWeight: "700",
  },
  modalText: {
    color: "#6A4B3D",
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalLink: {
    color: "#6A4B3D",
    fontSize: 14,
    fontWeight: "600",
  },
});
