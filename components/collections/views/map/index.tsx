import { useColorTheme } from "@/ui/color/theme-provider";
import { Platform, View } from "react-native";
import DomMapView from "./map";
import NativeMapView from "./NativeMap";

export default function MapView() {
  const theme = useColorTheme();

  return (
    <View style={{ flex: 1, flexDirection: "row", padding: 20, paddingTop: 0 }}>
      <View style={{ flex: 1 }}></View>
      <View
        style={{
          flex: 2,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: theme[3],
        }}
      >
        {Platform.OS === "web" ? <DomMapView /> : <NativeMapView />}
      </View>
    </View>
  );
}
