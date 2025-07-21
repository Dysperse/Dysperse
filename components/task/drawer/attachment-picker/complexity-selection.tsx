import { Button, ButtonText } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { ScrollView } from "react-native-gesture-handler";
import { useTaskDrawerContext } from "../context";

export function ComplexitySelector({ handleBack }) {
  const theme = useColorTheme();
  const { updateTask } = useTaskDrawerContext();
  const complexityScale = [
    "Minimal",
    "Little",
    "Moderate",
    "Significant",
    "Maximum",
  ];
  const legacyComplexityScale = [2, 4, 8, 16, 32];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 5 }}
    >
      {legacyComplexityScale.map((n, i) => (
        <Button
          key={n}
          variant="filled"
          large
          height={70}
          containerStyle={{ borderRadius: 20 }}
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
        >
          <ButtonText numberOfLines={2} weight={500}>
            {complexityScale[i]}
            {"\n"}
            <ButtonText weight={300} style={{ fontSize: 13 }} numberOfLines={2}>
              Effort
            </ButtonText>
          </ButtonText>
        </Button>
      ))}
    </ScrollView>
  );
}
