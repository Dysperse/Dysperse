"use dom";
import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Map, Marker } from "pigeon-maps";
import React from "react";

export default function DomMapView() {
  const isDark = useDarkMode();
  const theme = useColorTheme();

  return (
    <div
      className="t"
      style={{
        height: "100%",
      }}
    >
      {isDark && (
        <style
          dangerouslySetInnerHTML={{
            __html: `.leaflet-container {
                background: ${theme[3]};
            }
            .t{
                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            }`,
          }}
        />
      )}
      <Map
        height={"100%" as any}
        defaultZoom={2}
        attribution={<>Leaflet</>}
        twoFingerDrag
        provider={(x, y, z) => {
          const s = String.fromCharCode(97 + ((x + y + z) % 3));
          return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/${z}/${x}/${y}.png`;
        }}
        animate
        animateMaxScreens={5}
      >
        {[
          [34.0522, -118.2437], // North America
          [-34.6037, -58.3816], // South America
          [51.5074, -0.1278], // Europe
          [-33.9249, 18.4241], // Africa
          [35.6895, 139.6917], // Asia
          [-33.8688, 151.2093], // Australia
          [-75.250973, -0.071389], // Antarctica
        ].map((location, index) => (
          <Marker key={index} width={50} anchor={location} />
        ))}
      </Map>
    </div>
  );
}
