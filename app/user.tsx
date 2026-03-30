import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { PrimaryButton } from "../src/components/buttons";
import { LocationContext } from "../src/context/LocationContext";
import { apiService, NearbyDriver } from "../src/services/api";

interface Driver extends NearbyDriver {
  id: string;
}

export default function UserScreen() {
  const router = useRouter();
  const locationCtx = useContext(LocationContext);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(locationCtx.location);
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch nearby drivers from API
  const fetchNearbyDrivers = async (location: Location.LocationObject) => {
    try {
      const response = await apiService.getNearbyDrivers(
        location.coords.latitude,
        location.coords.longitude,
        10, // 10km radius
      );

      // Transform API response to include id field
      const drivers: Driver[] = response.drivers.map((driver) => ({
        ...driver,
        id: driver._id,
      }));

      setNearbyDrivers(drivers);
    } catch (error: any) {
      console.error("Error fetching nearby drivers:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch nearby drivers",
      );
    }
  };

  useEffect(() => {
    // Get current location
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Location permission is needed to find nearby drivers",
          );
          setIsLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setCurrentLocation(location);
        locationCtx.setLocation(location);

        // Initial fetch
        await fetchNearbyDrivers(location);

        // Set up polling every 10 seconds
        pollingInterval.current = setInterval(() => {
          fetchNearbyDrivers(location);
        }, 10000);
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert("Error", "Failed to get your location");
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentLocation();

    // Cleanup interval on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  if (isLoading || !currentLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F0B44C" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {nearbyDrivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{
              latitude: driver.location.latitude,
              longitude: driver.location.longitude,
            }}
            title={driver.fullName}
            description={`${driver.carPlateNo} • ${driver.distance} • ETA: ${driver.eta}`}
            pinColor="#F0B44C"
          />
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Drivers</Text>
        <PrimaryButton
          label="Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>

      <View style={styles.busCardContainer}>
        {nearbyDrivers.length > 0 ? (
          nearbyDrivers.map((driver) => (
            <View key={driver.id} style={styles.busCard}>
              <View style={styles.busInfo}>
                <Text style={styles.busName}>{driver.fullName}</Text>
                <Text style={styles.busDetails}>🚗 {driver.carPlateNo}</Text>
                <Text style={styles.busDetails}>
                  📍 {driver.fromBusPark} → {driver.toBusPark}
                </Text>
                <Text style={styles.busDetails}>📞 {driver.phoneNumber}</Text>
                <Text style={styles.busDetails}>
                  📏 {driver.distance} • ⏱️ {driver.eta}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.busCard}>
            <Text style={styles.noBusText}>No drivers nearby</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#7B4A35",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#F7E8DA",
    fontSize: 16,
    fontWeight: "600",
  },
  map: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#2C1810",
    fontSize: 24,
    fontWeight: "700",
    backgroundColor: "#F7E8DA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
  },
  busCardContainer: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    gap: 12,
  },
  busCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  busInfo: {
    flex: 1,
    gap: 4,
  },
  busName: {
    color: "#2C1810",
    fontSize: 18,
    fontWeight: "700",
  },
  busDetails: {
    color: "#6A4B3D",
    fontSize: 14,
  },
  busTime: {
    backgroundColor: "#F0B44C",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timeText: {
    color: "#2C1810",
    fontSize: 16,
    fontWeight: "700",
  },
  noBusText: {
    color: "#6A4B3D",
    fontSize: 16,
    textAlign: "center",
  },
});
