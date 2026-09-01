"use client";

import { useEffect, useRef } from "react";

const MARDAN_COORDINATES = {
  latitude: 34.1988,
  longitude: 72.0451,
};

export function ContactMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!mapContainerRef.current || mapRef.current) {
        return;
      }

      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) {
        return;
      }

      const map = L.map(mapContainerRef.current, {
        center: [MARDAN_COORDINATES.latitude, MARDAN_COORDINATES.longitude],
        zoom: 12,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      const markerIcon = L.divIcon({
        className: "alentah-map-marker",
        html: `
          <div
            style="
              width: 34px;
              height: 34px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 9999px;
              background: hsl(var(--primary));
              border: 3px solid hsl(var(--background));
              box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            "
          >
            <div
              style="
                width: 9px;
                height: 9px;
                border-radius: 9999px;
                background: hsl(var(--primary-foreground));
              "
            ></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17],
      });

      L.marker([MARDAN_COORDINATES.latitude, MARDAN_COORDINATES.longitude], {
        icon: markerIcon,
        title: "Alentah — Mardan, Khyber Pakhtunkhwa",
      })
        .addTo(map)
        .bindPopup("<strong>Alentah</strong><br />Mardan, Khyber Pakhtunkhwa, Pakistan");

      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };

    void initializeMap();

    return () => {
      isMounted = false;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="h-[300px] w-full overflow-hidden rounded-xl border border-border bg-muted/20 sm:h-[350px] lg:h-[420px]"
      aria-label="Map showing the general location of Alentah in Mardan, Khyber Pakhtunkhwa, Pakistan"
      role="application"
    />
  );
}
