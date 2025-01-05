import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { View } from "react-native";

export const TasksCreated = ({ data }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        padding: 20,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 20,
      }}
    >
      <Text
        style={{
          fontSize: 40,
          textAlign: "center",
        }}
      >
        {data.tasksCreated + data._count.entities}
      </Text>
      <Text
        style={{
          fontSize: 20,
          opacity: 0.5,
          textAlign: "center",
          marginBottom: 10,
        }}
        weight={500}
      >
        tasks created
      </Text>
    </View>
  );
};

