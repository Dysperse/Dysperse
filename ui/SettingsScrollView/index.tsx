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
        marginTop: breakpoints.md ? 0 : 100,
        paddingVertical: props.hideBack ? 0 : 50,
        paddingTop: breakpoints.md ? 50 : 20,
        paddingBottom: breakpoints.md ? 0 : 150,
        paddingHorizontal: props.hideBack ? 0 : 30,
      }}
      style={{ flex: 1 }}
    />
  );
}

