import React, { useEffect, useRef, useState, useCallback } from "react";
import { Location } from "../types";
import { TIMBERCREEK_CHURCH_COORDS } from "../constants";
import { CONFIG } from "../config";
import { useTheme } from "../src/context/ThemeContext";

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
    gm_authFailure: () => void;
  }
}

interface LocationMapProps {
  locations: Location[];
  selectedLocationId?: string | null;
  onMarkerClick?: (locationId: string) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({
  locations,
  selectedLocationId,
  onMarkerClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { theme } = useTheme();

  // DARK INDUSTRIAL MAP STYLE
  const DARK_MAP_STYLES = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "administrative.land_parcel",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#bdbdbd" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#181818" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1b1b1b" }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#2c2c2c" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#373737" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#3c3c3c" }],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [{ color: "#4e4e4e" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "transit",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#000000" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#3d3d3d" }],
    },
  ];

  const updateMarkers = useCallback(() => {
    if (!googleMapRef.current || !window.google || !window.google.maps) return;

    Object.values(markersRef.current).forEach((marker: any) =>
      marker.setMap(null),
    );
    markersRef.current = {};

    const bounds = new window.google.maps.LatLngBounds();
    let hasMarkers = false;

    locations.forEach((loc) => {
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        hasMarkers = true;
        // Custom Red Marker (SVG Path)
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: loc.name,
          animation: window.google.maps.Animation.DROP,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#D6181F",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
            scale: 8,
          },
        });

        marker.addListener("click", () => onMarkerClick?.(loc.id));
        markersRef.current[loc.id] = marker;
        bounds.extend({ lat, lng });
      }
    });

    if (selectedLocationId && markersRef.current[selectedLocationId]) {
      googleMapRef.current.panTo(
        markersRef.current[selectedLocationId].getPosition(),
      );
      googleMapRef.current.setZoom(15);
    } else if (hasMarkers && !selectedLocationId) {
      googleMapRef.current.fitBounds(bounds);
    } else if (!hasMarkers) {
      googleMapRef.current.setCenter({
        lat: TIMBERCREEK_CHURCH_COORDS.latitude,
        lng: TIMBERCREEK_CHURCH_COORDS.longitude,
      });
      googleMapRef.current.setZoom(12);
    }
  }, [locations, selectedLocationId, onMarkerClick]);

  // Update map styles when theme changes
  useEffect(() => {
    if (googleMapRef.current) {
      const styles = theme === "espresso" ? DARK_MAP_STYLES : [];
      googleMapRef.current.setOptions({ styles });
    }
  }, [theme]);

  useEffect(() => {
    const apiKey = CONFIG.GOOGLE_MAPS_API_KEY.trim();
    if (!apiKey) {
      setError("API Key missing.");
      return;
    }

    const SCRIPT_ID = "google-maps-script";
    window.gm_authFailure = () => setError("Authentication Failed.");
    window.initGoogleMaps = () => setIsMapLoaded(true);

    const existingScript = document.getElementById(
      SCRIPT_ID,
    ) as HTMLScriptElement;
    if (existingScript) {
      if (!existingScript.src.includes(apiKey)) {
        existingScript.remove();
        window.google = undefined;
      } else if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        return;
      }
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps&loading=async`;
      script.async = true;
      script.defer = true;
      script.onerror = () => setError("Failed to load Google Maps script.");
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (error || !isMapLoaded || !mapRef.current) return;
    if (googleMapRef.current) {
      updateMarkers();
      return;
    }

    try {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: {
          lat: TIMBERCREEK_CHURCH_COORDS.latitude,
          lng: TIMBERCREEK_CHURCH_COORDS.longitude,
        },
        zoom: 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        clickableIcons: false,
        gestureHandling: "greedy",
        mapId: "DEMO_MAP_ID",
        styles: theme === "espresso" ? DARK_MAP_STYLES : [], // Initial Theme
      });
      updateMarkers();
    } catch (e) {
      setError("Failed to initialize map.");
    }
  }, [isMapLoaded, error, updateMarkers]);

  if (error) {
    return (
      <div className="w-full h-full bg-surfaceHighlight border border-red-900 flex items-center justify-center text-red-500 font-bold uppercase">
        MAP OFFLINE
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-surfaceHighlight border-2 border-surface overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default LocationMap;
