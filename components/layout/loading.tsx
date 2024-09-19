import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { Platform, View } from "react-native";

export function SessionLoadingScreen() {
  const theme = useColorTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme[2],
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        },
        Platform.OS === "web" && ({ WebkitAppRegion: "drag" } as any),
      ]}
    >
      <Logo size={150} />
    </View>
  );
}

