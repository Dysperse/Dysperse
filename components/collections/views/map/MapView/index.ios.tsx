import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Spinner from "@/ui/Spinner";
import { useState } from "react";
import { View } from "react-native";
// @ts-expect-error
import { LeafletView } from "react-native-leaflet-view";

export default function NativeMapView({ tasks, onLocationSelect }) {
  const isDark = useDarkMode();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const [loaded, setLoaded] = useState(false);

  return (
    <View
      style={{ position: "relative", flex: 1, width: "100%", height: "100%" }}
    >
      <LeafletView
        key={isDark ? "dark" : "light"}
        androidHardwareAccelerationDisabled={`
          const style = document.createElement('style');
          style.innerHTML = \`
         .leaflet-container, body {
              background: ${theme[3]};
          }
          * {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0)!important;
            }
            .leaflet-control-attribution {margin:5px!important;border-radius:10px!important;background:${addHslAlpha(
              theme[9],
              0.1
            )}!important; 
            transform:scale(${breakpoints.md ? 0.9 : 0.65});
            backdrop-filter: blur(10px)!important;}
            .leaflet-control-attribution a {display: none !important;}
            .leaflet-control-attribution::after {content:"Carto";color:${addHslAlpha(
              theme[11],
              0.5
            )};
            }
        ${
          isDark
            ? `
           .leaflet-layer{
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
          }`
            : ""
        }
          .leaflet-control-zoom-in,
          .leaflet-control-zoom-out  {
            background: ${addHslAlpha(theme[9], 0.1)}!important;
            color: ${theme[11]}!important;
            border-color: ${addHslAlpha(theme[9], 0.1)}!important;
            backdrop-filter: blur(10px)!important;
          }
            .leaflet-control-zoom {
              border-radius: 100px!important;
              box-shadow: none !important;
              border: 0!important;
              overflow: hidden !important;
            }
          .leaflet-marker-icon.marker-cluster {
              display: none !important;
          }

          \`;
          document.head.appendChild(style);
        `}
        mapLayers={[
          {
            baseLayerIsChecked: true,
            baseLayerName: "CartoDB.VoyagerLabelsUnder",
            noWrap: true as any,
            // restrict view to the world and dont repeat the map
            url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
          },
        ]}
        onMessageReceived={(message) => {
          console.log(message);
          if (message.event === "onMapMarkerClicked")
            onLocationSelect(message.payload.mapMarkerID);
        }}
        mapMarkers={tasks.map((t) => ({
          icon: "https://cdn.jsdelivr.net/gh/dysperse/assets/pin.png",
          iconAnchor: [8, 29.5],
          size: [16, 29.5],
          position: t.location.coordinates,
          id: t.id,
        }))}
        zoom={1.5}
        mapCenterPosition={[0, 0]}
        onLoadEnd={() => setLoaded(true)}
        renderLoading={() => null}
        onError={() => alert("Error loading map")}
      />
      {!loaded && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme[3],
          }}
        >
          <Spinner />
        </View>
      )}
    </View>
  );
}
