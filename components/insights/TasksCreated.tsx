import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Text, { getFontName } from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { View } from "react-native";

export const TasksCreated = ({ data }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        flex: breakpoints.md ? 1 : undefined,
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 70,
          fontFamily: getFontName("jetBrainsMono", 500),
          textAlign: "center",
        }}
      >
        {data.tasksCreated + data._count.entities}
      </Text>
      <Text
        style={{
          fontSize: 20,
          opacity: 0.5,
          marginTop: -10,
          textAlign: "center",
        }}
        weight={500}
      >
        tasks created
      </Text>
    </View>
  );
};
