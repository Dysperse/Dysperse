import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Spinner from "@/ui/Spinner";
import { LeafletView } from "react-native-leaflet-view";

export default function NativeMapView() {
  const isDark = useDarkMode();
  const theme = useColorTheme();

  return (
    <LeafletView
      key={isDark ? "dark" : "light"}
      androidHardwareAccelerationDisabled={
        !isDark
          ? undefined
          : `
          const style = document.createElement('style');
          style.innerHTML = \`
         .leaflet-container {
              background: ${theme[3]};
          }
          * {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0)!important;
            }
            .leaflet-control-attribution {margin:10px!important;border-radius:10px!important;background:${addHslAlpha(
              theme[9],
              0.1
            )}!important; backdrop-filter: blur(10px)!important;}
            .leaflet-control-attribution a {display: none !important;}
            .leaflet-control-attribution::after {content:"Carto";color:${addHslAlpha(
              theme[9],
              0.5
            )};font-size:12px;}
         .leaflet-layer{
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
          }
          .leaflet-control-zoom-in,
          .leaflet-control-zoom-out  {
            background: ${addHslAlpha(theme[9], 0.1)}!important;
            color: ${theme[9]}!important;
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

          // Get the map instance
          const map = document.querySelector('.leaflet-container');
          // Set min zoom
          map.setMinZoom(18);
        `
      }
      mapLayers={[
        {
          baseLayerIsChecked: true,
          baseLayerName: "CartoDB.VoyagerLabelsUnder",
          noWrap: true as any,
          // restrict view to the world and dont repeat the map
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
        },
      ]}
      mapMarkers={[
        [34.0522, -118.2437], // North America
        [-34.6037, -58.3816], // South America
        [51.5074, -0.1278], // Europe
        [-33.9249, 18.4241], // Africa
        [35.6895, 139.6917], // Asia
        [-33.8688, 151.2093], // Australia
        [-75.250973, -0.071389], // Antarctica
      ].map((t) => ({
        icon: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconAnchor: [12, 41],
        size: [25, 41],
        position: t,
        id: "well, hello there",
        onClick: () => alert("Marker clicked"),
      }))}
      zoom={1.5}
      mapCenterPosition={[0, 0]}
      renderLoading={() => <Spinner />}
    />
  );
}
