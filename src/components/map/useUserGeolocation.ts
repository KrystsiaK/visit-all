"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GeolocationPermissionState =
  | "checking"
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported"
  | "error";

export type UserGeolocation = {
  lng: number;
  lat: number;
  accuracy: number | null;
  resolvedAt: number;
};

type UseUserGeolocationOptions = {
  autoRequest?: boolean;
};

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5 * 60 * 1000,
};

const getPermissionStateFromError = (error: GeolocationPositionError): GeolocationPermissionState =>
  error.code === error.PERMISSION_DENIED ? "denied" : "error";

const getInitialPermissionState = (): GeolocationPermissionState => {
  if (typeof window === "undefined") {
    return "checking";
  }

  if (!("geolocation" in navigator)) {
    return "unsupported";
  }

  if (!("permissions" in navigator) || typeof navigator.permissions.query !== "function") {
    return "prompt";
  }

  return "checking";
};

export const useUserGeolocation = ({ autoRequest = true }: UseUserGeolocationOptions = {}) => {
  const [permissionState, setPermissionState] = useState<GeolocationPermissionState>(getInitialPermissionState);
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState<UserGeolocation | null>(null);

  const autoRequestedRef = useRef(false);
  const locationRequestInFlightRef = useRef(false);

  const requestLocation = useCallback((reason: "auto" | "manual" = "manual") => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setPermissionState("unsupported");
      return;
    }

    if (locationRequestInFlightRef.current) {
      return;
    }

    locationRequestInFlightRef.current = true;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationRequestInFlightRef.current = false;
        setIsLocating(false);
        setPermissionState("granted");
        setLocation({
          lng: position.coords.longitude,
          lat: position.coords.latitude,
          accuracy: position.coords.accuracy ?? null,
          resolvedAt: Date.now(),
        });

        if (reason === "auto") {
          autoRequestedRef.current = true;
        }
      },
      (error) => {
        locationRequestInFlightRef.current = false;
        setIsLocating(false);
        setPermissionState(getPermissionStateFromError(error));

        if (reason === "auto") {
          autoRequestedRef.current = true;
        }
      },
      {
        ...GEOLOCATION_OPTIONS,
        maximumAge: reason === "manual" ? 0 : GEOLOCATION_OPTIONS.maximumAge,
      }
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      return;
    }

    const maybeAutoRequest = (state: PermissionState | "unsupported") => {
      if (!autoRequest || autoRequestedRef.current || state === "denied" || state === "unsupported") {
        return;
      }

      requestLocation("auto");
    };

    if (!("permissions" in navigator) || typeof navigator.permissions.query !== "function") {
      maybeAutoRequest("prompt");
      return;
    }

    let cancelled = false;
    let permissionStatus: PermissionStatus | null = null;

    void navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (cancelled) {
          return;
        }

        permissionStatus = status;
        setPermissionState(status.state as GeolocationPermissionState);
        maybeAutoRequest(status.state);

        permissionStatus.onchange = () => {
          setPermissionState(status.state as GeolocationPermissionState);

          if (status.state === "granted" && !locationRequestInFlightRef.current) {
            requestLocation("auto");
          }
        };
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setPermissionState("prompt");
        maybeAutoRequest("prompt");
      });

    return () => {
      cancelled = true;
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [autoRequest, requestLocation]);

  return {
    isLocating,
    location,
    permissionState,
    requestLocation,
  };
};
