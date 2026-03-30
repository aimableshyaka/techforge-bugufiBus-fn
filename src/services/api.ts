import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/";

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverProfile {
  id: string;
  carPlateNo: string;
  fromBusPark: string;
  toBusPark: string;
  phoneVisible: boolean;
  fullName?: string;
  phoneNumber?: string;
}

export interface DriverProfileResponse {
  success: boolean;
  profile?: DriverProfile;
  message?: string;
  error?: string;
}

export interface NearbyDriver {
  id: string;
  driverName: string;
  phoneNumber: string;
  phoneVisible: boolean;
  carPlateNo: string;
  fromBusPark: string;
  toBusPark: string;
  location: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  };
  distance: number;
  eta: number;
  etaFormatted: string;
  lastUpdate: string;
}

export interface NearbyDriversResponse {
  success: boolean;
  drivers?: NearbyDriver[];
  count?: number;
  message?: string;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem("authToken", token);
  }

  async getToken() {
    if (!this.token) {
      this.token = await AsyncStorage.getItem("authToken");
    }
    return this.token;
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem("authToken");
  }

  private getHeaders(includeAuth: boolean = true) {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (includeAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async register(
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: this.getHeaders(false),
        body: JSON.stringify({
          fullName,
          email,
          phoneNumber,
          password,
        }),
      });

      const data = await response.json();

      if (data.token) {
        await this.setToken(data.token);
      }

      return data;
    } catch (error: any) {
      console.error("Register error:", error);
      return {
        success: false,
        message: "Network error during registration",
        error: error.message,
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: this.getHeaders(false),
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.token) {
        await this.setToken(data.token);
      }

      return data;
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Network error during login",
        error: error.message,
      };
    }
  }

  async getCurrentUser(): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      const token = await this.getToken();
      if (!token) {
        return { success: false, error: "No token found" };
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: this.getHeaders(true),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Get user error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      const token = await this.getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: this.getHeaders(true),
        });
      }

      await this.clearToken();

      return { success: true, message: "Logged out successfully" };
    } catch (error: any) {
      console.error("Logout error:", error);
      await this.clearToken();
      return { success: false, error: error.message };
    }
  }

  // Driver Profile APIs
  async createOrUpdateDriverProfile(
    carPlateNo: string,
    fromBusPark: string,
    toBusPark: string,
    phoneVisible: boolean = true,
  ): Promise<DriverProfileResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        return { success: false, error: "No token found" };
      }

      const response = await fetch(`${API_BASE_URL}/driver/profile`, {
        method: "POST",
        headers: this.getHeaders(true),
        body: JSON.stringify({
          carPlateNo,
          fromBusPark,
          toBusPark,
          phoneVisible,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Create/Update driver profile error:", error);
      return {
        success: false,
        message: "Network error during profile save",
        error: error.message,
      };
    }
  }

  async getDriverProfile(): Promise<DriverProfileResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        return { success: false, error: "No token found" };
      }

      const response = await fetch(`${API_BASE_URL}/driver/profile`, {
        method: "GET",
        headers: this.getHeaders(true),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Get driver profile error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updatePhoneVisibility(phoneVisible: boolean): Promise<{
    success: boolean;
    phoneVisible?: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const token = await this.getToken();
      if (!token) {
        return { success: false, error: "No token found" };
      }

      const response = await fetch(
        `${API_BASE_URL}/driver/profile/phone-visibility`,
        {
          method: "PATCH",
          headers: this.getHeaders(true),
          body: JSON.stringify({ phoneVisible }),
        },
      );

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Update phone visibility error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getPublicDriverProfile(
    driverId: string,
  ): Promise<DriverProfileResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/driver/profile/${driverId}`,
        {
          method: "GET",
          headers: this.getHeaders(false),
        },
      );

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Get public driver profile error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Driver Location APIs
  async updateDriverLocation(
    latitude: number,
    longitude: number,
    heading?: number,
    speed?: number,
  ): Promise<{
    success: boolean;
    location?: any;
    message?: string;
    error?: string;
  }> {
    try {
      const token = await this.getToken();
      if (!token) {
        return { success: false, error: "No token found" };
      }

      const response = await fetch(`${API_BASE_URL}/driver/location`, {
        method: "POST",
        headers: this.getHeaders(true),
        body: JSON.stringify({
          latitude,
          longitude,
          heading,
          speed,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Update driver location error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async stopSharingLocation(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const token = await this.getToken();
      if (!token) {
        return { success: false, error: "No token found" };
      }

      const response = await fetch(`${API_BASE_URL}/driver/location/stop`, {
        method: "POST",
        headers: this.getHeaders(true),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Stop sharing location error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getNearbyDrivers(
    latitude: number,
    longitude: number,
    radius: number = 10,
  ): Promise<NearbyDriversResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/driver/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
        {
          method: "GET",
          headers: this.getHeaders(false),
        },
      );

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Get nearby drivers error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const apiService = new ApiService();
