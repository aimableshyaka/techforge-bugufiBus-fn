import * as Location from "expo-location";
import React, { createContext, ReactNode, useState } from "react";

interface LocationContextType {
  location: Location.LocationObject | null;
  setLocation: (location: Location.LocationObject | null) => void;
  isLocationGranted: boolean;
  setIsLocationGranted: (granted: boolean) => void;
}

export const LocationContext = createContext<LocationContextType>({
  location: null,
  setLocation: () => {},
  isLocationGranted: false,
  setIsLocationGranted: () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [isLocationGranted, setIsLocationGranted] = useState(false);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        isLocationGranted,
        setIsLocationGranted,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
