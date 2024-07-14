import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ScrollViewProps } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function SettingsScrollView(
  props: ScrollViewProps & { hideBack?: boolean }
) {
  const breakpoints = useResponsiveBreakpoints();
  return (
    <ScrollView
      {...props}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: props.hideBack ? 0 : 50,
        paddingTop: breakpoints.md ? 50 : 20,
        paddingHorizontal: props.hideBack ? 0 : 20,
      }}
      style={{ flex: 1 }}
    />
  );
}
