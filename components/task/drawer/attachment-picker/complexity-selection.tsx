import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { View } from "react-native";
import { useTaskDrawerContext } from "../context";

export function ComplexitySelector({ handleBack }) {
  const theme = useColorTheme();
  const { updateTask } = useTaskDrawerContext();
  const complexityScale = ["XS", "S", "M", "L", "XL"];
  const legacyComplexityScale = [2, 4, 8, 16, 32];

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
      }}
    >
      {legacyComplexityScale.map((n, i) => (
        <View key={i} style={{ width: "20%", paddingHorizontal: 2 }}>
          <Button
            variant="filled"
            large
            textStyle={{ fontFamily: "mono" }}
            text={complexityScale[i]}
            onPress={() => {
              updateTask({
                storyPoints: n,
              });
              handleBack();
            }}
            backgroundColors={{
              default: addHslAlpha(theme[11], 0.1),
              hovered: addHslAlpha(theme[11], 0.2),
              pressed: addHslAlpha(theme[11], 0.3),
            }}
          />
        </View>
      ))}
    </View>
  );
}
