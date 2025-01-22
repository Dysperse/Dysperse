"use dom";
import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
// @ts-ignore
import { Map, Marker } from "pigeon-maps";
import React from "react";

export default function MapView({ tasks, onLocationSelect }) {
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
            __html: `.container {
                background: ${theme[isDark ? 12 : 3]};
            }
            .t{
                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
            // .t .marker {
            //   filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            // }
            `,
          }}
        />
      )}
      <Map
        height={"100%" as any}
        defaultZoom={1.44}
        attributionPrefix={<>Carto</>}
        attribution={<></>}
        twoFingerDrag
        // zoomSnap={false}
        provider={(x, y, z) => {
          const s = String.fromCharCode(97 + ((x + y + z) % 3));
          return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/${z}/${x}/${y}.png`;
        }}
        minZoom={1.44}
        limitBounds="edge"
        animate
        animateMaxScreens={5}
        boxClassname="container"
      >
        {tasks.map((task) => (
          <Marker
            key={task.id}
            width={30}
            anchor={task.location.coordinates.map((t) => parseFloat(t))}
            className="marker"
            onClick={() => onLocationSelect(task.id)}
          />
        ))}

        {/* tasks.map((t) => ({
          icon: `https://cdn.jsdelivr.net/gh/dysperse/assets/pin.png`,
          iconAnchor: [8, 29.5],
          size: [16, 29.5],
          position: t.location.coordinates,
          id: t.id,
        })) */}
      </Map>
    </div>
  );
}
