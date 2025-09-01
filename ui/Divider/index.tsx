import { StyleProp, View, ViewStyle } from "react-native";
import { addHslAlpha } from "../color";
import { useColorTheme } from "../color/theme-provider";

export default function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useColorTheme();
  return (
    <View style={{ paddingHorizontal: 7 }}>
      <View
        style={[
          {
            height: 2,
            backgroundColor: addHslAlpha(theme[11], 0.1),
            marginVertical: 5,
            borderRadius: 99,
            width: "100%",
            marginHorizontal: "auto",
          },
          style,
        ]}
      />
    </View>
  );
}

