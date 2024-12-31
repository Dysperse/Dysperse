import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ScrollViewProps, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScrollView(
  props: ScrollViewProps & { hideBack?: boolean }
) {
  const breakpoints = useResponsiveBreakpoints();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      {...props}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        marginTop: 100,
        paddingVertical: props.hideBack ? 0 : 50,
        paddingTop: breakpoints.md ? 50 : 20,
        paddingHorizontal: props.hideBack ? 0 : 30,
      }}
      style={{ flex: 1 }}
    />
  );
}

