import { useColorTheme } from "@/ui/color/theme-provider";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ContentWrapper(props) {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        marginTop: insets.top + 64,
        backgroundColor: theme[1],
        borderTopLeftRadius: 20,
        flex: 1,
      }}
      {...props}
    />
  );
}
