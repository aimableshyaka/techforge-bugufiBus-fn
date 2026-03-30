import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  Switch,
} from "react-native";
import { LocationContext } from "../src/context/LocationContext";
import { AuthContext } from "../src/context/AuthContext";
import { useContext, useState, useEffect } from "react";
import { InputField } from "../src/components/input";
import { PrimaryButton } from "../src/components/buttons";
import { apiService } from "../src/services/api";

interface DashboardCard {
  id: string;
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface Trip {
  id: string;
  route: string;
  departure: string;
  arrival: string;
  passengers: number;
  status: "upcoming" | "active" | "completed";
}

interface DriverProfile {
  id?: string;
  fullName: string;
  phoneNumber: string;
  carPlateNo: string;
  fromBusPark: string;
  toBusPark: string;
  phoneVisible: boolean;
}

export default function DriverDashboard() {
  const router = useRouter();
  const { logout, user } = useContext(AuthContext);
  const { location, setLocation, isLocationGranted, setIsLocationGranted } =
    useContext(LocationContext);
  const [isSharing, setIsSharing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showViewProfileModal, setShowViewProfileModal] = useState(false);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [formData, setFormData] = useState<DriverProfile>({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    carPlateNo: "",
    fromBusPark: "",
    toBusPark: "",
    phoneVisible: true,
  });
  const [errors, setErrors] = useState<Partial<DriverProfile>>({});
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load driver profile on mount
  useEffect(() => {
    loadDriverProfile();
  }, []);

  const loadDriverProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await apiService.getDriverProfile();
      if (response.success && response.profile) {
        setProfile(response.profile);
        setPhoneVisible(response.profile.phoneVisible);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Mock data
  const dashboardCards: DashboardCard[] = [
    {
      id: "1",
      title: "Today's Trips",
      value: "4",
      icon: "routes",
      color: "#F0B44C",
    },
    {
      id: "2",
      title: "Total Passengers",
      value: "87",
      icon: "account-multiple",
      color: "#87D4A9",
    },
    {
      id: "3",
      title: "Rating",
      value: "4.8★",
      icon: "star",
      color: "#FFB74D",
    },
    {
      id: "4",
      title: "Distance",
      value: "142 km",
      icon: "map-marker-distance",
      color: "#64B5F6",
    },
  ];

  const upcomingTrips: Trip[] = [
    {
      id: "1",
      route: "Downtown → Airport",
      departure: "09:30",
      arrival: "10:15",
      passengers: 32,
      status: "upcoming",
    },
    {
      id: "2",
      route: "Airport → Central Station",
      departure: "10:45",
      arrival: "11:30",
      passengers: 28,
      status: "upcoming",
    },
    {
      id: "3",
      route: "Central Station → Downtown",
      departure: "14:00",
      arrival: "14:45",
      passengers: 35,
      status: "upcoming",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const validateProfile = (): boolean => {
    const newErrors: Partial<DriverProfile> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (
      !/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))
    ) {
      newErrors.phoneNumber = "Invalid phone number format";
    }
    if (!formData.carPlateNo.trim()) {
      newErrors.carPlateNo = "Car plate number is required";
    }
    if (!formData.fromBusPark.trim()) {
      newErrors.fromBusPark = "Starting bus park is required";
    }
    if (!formData.toBusPark.trim()) {
      newErrors.toBusPark = "Destination bus park is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    try {
      setIsLoadingProfile(true);
      const response = await apiService.createOrUpdateDriverProfile(
        formData.carPlateNo,
        formData.fromBusPark,
        formData.toBusPark,
        phoneVisible,
      );

      if (response.success && response.profile) {
        setProfile(response.profile);
        setShowProfileModal(false);
        Alert.alert("Success", "Driver profile saved successfully!");
      } else {
        Alert.alert("Error", response.message || "Failed to save profile");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const maskPhoneNumber = (phone: string): string => {
    if (!phone) return "";
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length <= 4) return "***";
    const lastFour = cleaned.slice(-4);
    const masked = "*".repeat(cleaned.length - 4);
    return masked + lastFour;
  };

  const handleViewProfile = () => {
    if (!profile) {
      Alert.alert("No Profile", "Please create your driver profile first.");
      return;
    }
    setShowViewProfileModal(true);
  };

  const handleCreateProfile = () => {
    setFormData({
      fullName: user?.fullName || "",
      phoneNumber: user?.phoneNumber || "",
      carPlateNo: profile?.carPlateNo || "",
      fromBusPark: profile?.fromBusPark || "",
      toBusPark: profile?.toBusPark || "",
      phoneVisible: profile?.phoneVisible ?? true,
    });
    setPhoneVisible(profile?.phoneVisible ?? true);
    setErrors({});
    setShowProfileModal(true);
  };

  const handleShareLocation = async () => {
    try {
      setIsSharing(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        setIsLocationGranted(true);

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // Store location in context
        setLocation(currentLocation);

        // Start watching location updates and share with backend
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Or when moved 10 meters
          },
          async (loc) => {
            setLocation(loc);

            // Send location to backend
            try {
              await apiService.updateDriverLocation(
                loc.coords.latitude,
                loc.coords.longitude,
                loc.coords.heading || undefined,
                loc.coords.speed || undefined,
              );
            } catch (error) {
              console.error("Error updating location:", error);
            }
          },
        );

        Alert.alert(
          "Location Sharing Active",
          "Your location is now being shared with nearby users. Tap 'Stop Sharing' to turn it off.",
          [{ text: "OK" }],
        );

        // Store subscription for cleanup
        return () => {
          subscription.remove();
        };
      } else {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to share your location.",
        );
        setIsLocationGranted(false);
        setIsSharing(false);
      }
    } catch (error) {
      console.error("Error sharing location:", error);
      Alert.alert("Error", "Failed to share your location. Please try again.");
      setIsSharing(false);
    }
  };

  const handleStopSharing = async () => {
    try {
      const response = await apiService.stopSharingLocation();
      if (response.success) {
        setIsSharing(false);
        Alert.alert("Success", "Location sharing stopped");
      } else {
        Alert.alert("Error", response.message || "Failed to stop sharing");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to stop location sharing");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "#F0B44C";
      case "active":
        return "#87D4A9";
      case "completed":
        return "#A89080";
      default:
        return "#6C3F2C";
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.driverName}>{user?.fullName || "Driver"}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.profileButton} onPress={handleViewProfile}>
            <MaterialCommunityIcons name="account" size={20} color="#F0B44C" />
          </Pressable>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="#D32F2F" />
          </Pressable>
        </View>
      </View>

      {/* Dashboard Cards */}
      <View style={styles.cardsGrid}>
        {dashboardCards.map((card) => (
          <View key={card.id} style={styles.card}>
            <View
              style={[
                styles.cardIconContainer,
                { backgroundColor: card.color + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name={card.icon as any}
                size={32}
                color={card.color}
              />
            </View>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </View>
        ))}
      </View>

      {/* Active Trip */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Route</Text>
        <View style={styles.activeTrip}>
          <View style={styles.activeTripLeft}>
            <View style={[styles.statusBadge, { backgroundColor: "#87D4A9" }]}>
              <MaterialCommunityIcons name="play" size={16} color="#FFF" />
            </View>
            <View style={styles.activeTripInfo}>
              <Text style={styles.activeTripRoute}>Downtown → Airport</Text>
              <Text style={styles.activeTripTime}>Starting in 5 minutes</Text>
            </View>
          </View>
          <View style={styles.activeTripRight}>
            <Text style={styles.activeTripPassengers}>32</Text>
            <Text style={styles.activeTripLabel}>Passengers</Text>
          </View>
        </View>
      </View>

      {/* Upcoming Trips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Pressable>
            <Text style={styles.viewAllLink}>View All</Text>
          </Pressable>
        </View>

        {upcomingTrips.map((trip, index) => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.tripTime}>
              <Text style={styles.tripDeparture}>{trip.departure}</Text>
              <View style={styles.tripDots}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
              <Text style={styles.tripArrival}>{trip.arrival}</Text>
            </View>

            <View style={styles.tripInfo}>
              <Text style={styles.tripRoute}>{trip.route}</Text>
              <View style={styles.tripMeta}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="account-multiple"
                    size={14}
                    color="#A89080"
                  />
                  <Text style={styles.metaText}>{trip.passengers}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadgeSmall,
                    {
                      backgroundColor: getStatusColor(trip.status) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(trip.status) },
                    ]}
                  >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable style={styles.tripAction}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#F0B44C"
              />
            </Pressable>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton} onPress={handleCreateProfile}>
            <MaterialCommunityIcons
              name="account-edit"
              size={24}
              color="#F0B44C"
            />
            <Text style={styles.actionLabel}>
              {profile ? "Edit Profile" : "Create Profile"}
            </Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <MaterialCommunityIcons name="map" size={24} color="#F0B44C" />
            <Text style={styles.actionLabel}>Live Map</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <MaterialCommunityIcons name="message" size={24} color="#F0B44C" />
            <Text style={styles.actionLabel}>Messages</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <MaterialCommunityIcons
              name="file-document"
              size={24}
              color="#F0B44C"
            />
            <Text style={styles.actionLabel}>Reports</Text>
          </Pressable>
        </View>
      </View>

      {/* Share Location Button */}
      <View style={styles.section}>
        <Pressable
          style={[
            styles.shareLocationButton,
            isSharing && styles.shareLocationButtonActive,
          ]}
          onPress={isSharing ? handleStopSharing : handleShareLocation}
        >
          <MaterialCommunityIcons
            name={isSharing ? "map-marker-check" : "map-marker-plus"}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.shareLocationText}>
            {isSharing ? "Stop Sharing Location" : "Share My Location"}
          </Text>
        </Pressable>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.spacing} />

      {/* Create/Edit Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {profile ? "Edit Profile" : "Create Driver Profile"}
              </Text>
              <Pressable onPress={() => setShowProfileModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#2C1810"
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                error={errors.fullName}
              />

              <InputField
                label="Phone Number"
                placeholder="+1234567890"
                value={formData.phoneNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, phoneNumber: text })
                }
                keyboardType="phone-pad"
                error={errors.phoneNumber}
              />

              <InputField
                label="Car Plate Number"
                placeholder="ABC-123"
                value={formData.carPlateNo}
                onChangeText={(text) =>
                  setFormData({ ...formData, carPlateNo: text })
                }
                error={errors.carPlateNo}
                autoCapitalize="characters"
              />

              <InputField
                label="From Bus Park"
                placeholder="Starting bus park location"
                value={formData.fromBusPark}
                onChangeText={(text) =>
                  setFormData({ ...formData, fromBusPark: text })
                }
                error={errors.fromBusPark}
                autoCapitalize="words"
              />

              <InputField
                label="To Bus Park"
                placeholder="Destination bus park location"
                value={formData.toBusPark}
                onChangeText={(text) =>
                  setFormData({ ...formData, toBusPark: text })
                }
                error={errors.toBusPark}
                autoCapitalize="words"
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowProfileModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <PrimaryButton
                  label="Save Profile"
                  onPress={handleSaveProfile}
                  style={styles.saveButton}
                  disabled={isLoadingProfile}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* View Profile Modal */}
      <Modal
        visible={showViewProfileModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowViewProfileModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.viewProfileContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Driver Profile</Text>
              <Pressable onPress={() => setShowViewProfileModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#2C1810"
                />
              </Pressable>
            </View>

            <View style={styles.profileContent}>
              <View style={styles.profileAvatar}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={80}
                  color="#F0B44C"
                />
              </View>

              <View style={styles.profileField}>
                <Text style={styles.profileLabel}>Full Name</Text>
                <Text style={styles.profileValue}>{profile?.fullName}</Text>
              </View>

              <View style={styles.profileField}>
                <View style={styles.profileFieldHeader}>
                  <Text style={styles.profileLabel}>Phone Number</Text>
                  <View style={styles.visibilityToggle}>
                    <Text style={styles.toggleLabel}>
                      {profile?.phoneVisible ? "Visible" : "Hidden"}
                    </Text>
                    <Switch
                      value={profile?.phoneVisible ?? true}
                      onValueChange={async (value) => {
                        if (profile) {
                          try {
                            const response =
                              await apiService.updatePhoneVisibility(value);
                            if (response.success) {
                              const updatedProfile = {
                                ...profile,
                                phoneVisible: value,
                              };
                              setProfile(updatedProfile);
                            } else {
                              Alert.alert(
                                "Error",
                                response.message ||
                                  "Failed to update visibility",
                              );
                            }
                          } catch (error: any) {
                            Alert.alert(
                              "Error",
                              "Failed to update phone visibility",
                            );
                          }
                        }
                      }}
                      trackColor={{ false: "#A89080", true: "#87D4A9" }}
                      thumbColor={profile?.phoneVisible ? "#F0B44C" : "#F7E8DA"}
                    />
                  </View>
                </View>
                <Text style={styles.profileValue}>
                  {profile?.phoneVisible
                    ? profile?.phoneNumber
                    : maskPhoneNumber(profile?.phoneNumber || "")}
                </Text>
              </View>

              <View style={styles.profileField}>
                <Text style={styles.profileLabel}>Car Plate Number</Text>
                <Text style={styles.profileValue}>{profile?.carPlateNo}</Text>
              </View>

              <View style={styles.profileField}>
                <Text style={styles.profileLabel}>Route</Text>
                <Text style={styles.profileValue}>
                  {profile?.fromBusPark} → {profile?.toBusPark}
                </Text>
              </View>

              <PrimaryButton
                label="Edit Profile"
                onPress={() => {
                  setShowViewProfileModal(false);
                  handleCreateProfile();
                }}
                style={styles.editButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#7B4A35",
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 32,
  },
  greeting: {
    color: "#E7D6C9",
    fontSize: 14,
    fontWeight: "500",
  },
  driverName: {
    color: "#F7E8DA",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  profileButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 12,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  cardValue: {
    color: "#2C1810",
    fontSize: 20,
    fontWeight: "700",
  },
  cardTitle: {
    color: "#6A4B3D",
    fontSize: 12,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#2C1810",
    fontSize: 18,
    fontWeight: "700",
  },
  viewAllLink: {
    color: "#F0B44C",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTrip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  activeTripLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTripInfo: {
    gap: 4,
  },
  activeTripRoute: {
    color: "#2C1810",
    fontSize: 16,
    fontWeight: "700",
  },
  activeTripTime: {
    color: "#A89080",
    fontSize: 12,
  },
  activeTripRight: {
    alignItems: "center",
  },
  activeTripPassengers: {
    color: "#2C1810",
    fontSize: 20,
    fontWeight: "700",
  },
  activeTripLabel: {
    color: "#A89080",
    fontSize: 12,
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tripTime: {
    alignItems: "center",
    gap: 8,
  },
  tripDeparture: {
    color: "#2C1810",
    fontSize: 14,
    fontWeight: "700",
  },
  tripDots: {
    flexDirection: "row",
    gap: 2,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#A89080",
  },
  tripArrival: {
    color: "#2C1810",
    fontSize: 14,
    fontWeight: "700",
  },
  tripInfo: {
    flex: 1,
    gap: 8,
  },
  tripRoute: {
    color: "#2C1810",
    fontSize: 14,
    fontWeight: "600",
  },
  tripMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: "#A89080",
    fontSize: 12,
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  tripAction: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionLabel: {
    color: "#2C1810",
    fontSize: 12,
    fontWeight: "600",
  },
  shareLocationButton: {
    backgroundColor: "#87D4A9",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  shareLocationButtonActive: {
    backgroundColor: "#64B5F6",
    opacity: 0.8,
  },
  shareLocationText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  spacing: {
    height: 32,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#7B4A35",
    borderRadius: 20,
    width: "100%",
    maxHeight: "85%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#6C3F2C",
    backgroundColor: "#F7E8DA",
  },
  modalTitle: {
    color: "#2C1810",
    fontSize: 20,
    fontWeight: "700",
  },
  modalContent: {
    padding: 20,
    gap: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#6C3F2C",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#F7E8DA",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
  },
  viewProfileContainer: {
    backgroundColor: "#F7E8DA",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  profileContent: {
    padding: 24,
    gap: 20,
  },
  profileAvatar: {
    alignItems: "center",
    marginBottom: 8,
  },
  profileField: {
    gap: 6,
  },
  profileFieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  visibilityToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleLabel: {
    color: "#6A4B3D",
    fontSize: 12,
    fontWeight: "600",
  },
  profileLabel: {
    color: "#A89080",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  profileValue: {
    color: "#2C1810",
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    marginTop: 8,
  },
});
