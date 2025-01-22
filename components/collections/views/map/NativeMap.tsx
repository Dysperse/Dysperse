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
        // MIT campus
        [42.3601, -71.0942],
        // Harvard campus
        [42.3736, -71.1097],
        // Stanford campus
        [37.4275, -122.1697],
        // UC Berkeley campus
        [37.8719, -122.2585],
        // Caltech campus
        [34.1379, -118.1253],
        // Duke campus
        [36.0014, -78.9382],
        // Brown campus
        [41.8262, -71.4032],
        // Yale campus
        [41.3163, -72.9223],
        // Princeton campus
        [40.3461, -74.6552],
        // Columbia campus
        [40.8075, -73.9626],
        // Cornell campus
        [42.4534, -76.4735],
        // Penn campus
        [39.9526, -75.1652],
        // UChicago campus
        [41.7886, -87.5987],
        // Northwestern campus
        [42.0565, -87.6752],
        // Michigan campus
        [42.278, -83.7382],
        // UW Madison campus
        [43.076, -89.4125],
        // UMN Twin Cities campus
        [44.9727, -93.2354],
        // UT Austin campus
        [30.2849, -97.7341],
        // Rice campus
        [29.7174, -95.4018],
        // UCLA campus
        [34.0689, -118.4452],
        // USC campus
        [34.0224, -118.2851],
        // UCSD campus
        [32.8801, -117.234],
        // UCSB campus
        [34.4133, -119.8489],
        // UCSC campus
        [36.9914, -122.058],
        // UCI campus
        [33.6469, -117.8422],
        // UC Davis campus
        [38.5382, -121.7617],
        // UC Riverside campus
        [33.9738, -117.3281],
        // UT Dallas campus
        [32.9856, -96.7501],
        // ASU campus
        [33.4241, -111.928],
        // UW Seattle campus
        [47.6553, -122.3035],
        // UO campus
        [44.0448, -123.0726],
        // OSU campus
        [44.5672, -123.2792],
        // WSU campus
        [46.7319, -117.1542],
        // KU campus
        [38.9586, -95.2479],
      ].map((t) => ({
        icon: `https://cdn.jsdelivr.net/gh/dysperse/assets/pin.png`,
        iconAnchor: [8, 29.5],
        size: [16, 29.5],
        position: t,
        id: "well, hello there",
      }))}
      zoom={1.5}
      mapCenterPosition={[0, 0]}
      renderLoading={() => <Spinner />}
    />
  );
}
