import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Spinner from "@/ui/Spinner";
import { LeafletView } from "react-native-leaflet-view";

export default function NativeMapView() {
  const isDark = useDarkMode();
  const theme = useColorTheme();

  return (
    <LeafletView
      //   this is patched and actually injects javascript 💀💀💀
      //   if you are looking at this, may god have mercy on your soul
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
         .leaflet-layer,
          .leaflet-control-zoom-in,
          .leaflet-control-zoom-out,
          .leaflet-control-attribution {
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
          }
          \`;
          document.head.appendChild(style);
        `
      }
      mapLayers={[
        //   isDark
        //     ? {
        //         attribution: "Carto",
        //         baseLayerIsChecked: true,
        //         baseLayerName: "CartoDB.DarkMatter",
        //         url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        //       }
        //     :
        {
          attribution: "Carto",
          baseLayerIsChecked: true,
          baseLayerName: "CartoDB.VoyagerLabelsUnder",
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
        },
      ]}
      mapMarkers={
        [
          // {
          //   icon: "https://leafletjs.com/examples/custom-icons/leaf-green.png",
          //   iconAnchor: [12, 41],
          //   size: [25, 41],
          //   position: [51.505, -0.09],
          // },
        ]
      }
      zoom={5}
      mapCenterPosition={[0, -0.09]}
      renderLoading={() => <Spinner />}
    />
  );
}
