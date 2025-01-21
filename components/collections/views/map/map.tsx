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
        defaultCenter={[50.879, 4.6997]}
        defaultZoom={11}
        attribution={<>Leaflet</>}
        twoFingerDrag
        provider={(x, y, z) => {
          const s = String.fromCharCode(97 + ((x + y + z) % 3));
          return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/${z}/${x}/${y}.png`;
        }}
      >
        <Marker width={50} anchor={[50.879, 4.6997]} />
      </Map>
    </div>
  );
}
