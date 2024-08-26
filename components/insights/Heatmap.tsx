import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha, useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 1,
    justifyContent: "center",
  },
  cell: {
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  cellText: {
    color: "#000",
    fontWeight: "bold",
  },
});

export const Heatmap = ({ data }) => {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const gray = useColor("gray");

  const commitsData = [
    ...new Array(dayjs().diff(dayjs().subtract(1, "year"), "days")),
  ]
    .map((_, i) => ({
      date: dayjs().subtract(1, "year").add(i, "day").format("YYYY-MM-DD"),
      count: 0,
    }))
    .map((day) => ({
      ...day,
      count:
        data?.completionInstances?.filter(
          (e) =>
            e.completedAt &&
            dayjs(e.completedAt).format("YYYY-MM-DD") === day.date
        ).length || 0,
    }));

  const counts = commitsData.map((item) => item.count);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);

  const getColor = (count) => {
    const lightness = ((count - minCount) / (maxCount - minCount)) * 70;
    return [theme[11], addHslAlpha(theme[11], lightness * 0.01)];
  };

  return (
    <View
      style={{
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
      }}
    >
      <Text
        style={{
          fontSize: breakpoints.md ? 30 : 25,
          marginTop: 20,
          marginBottom: 5,
          marginLeft: 22,
        }}
        weight={700}
      >
        {data.completionInstances.length}{" "}
        {data.completionInstances.length === 1 ? "task" : "tasks"} completed in
        the last year
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", flex: 1 }}>
        {commitsData.map((item, index) => {
          const t = getColor(item.count);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.cell,
                {
                  width: `${100 / 52}%`,
                  aspectRatio: "1 / 1",
                  backgroundColor: t[0],
                  borderWidth: 1,
                  borderColor: t[1],
                },
              ]}
              onPress={() => alert(item.date)}
            ></TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
