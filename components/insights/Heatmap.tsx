import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

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
    }))
    .reduce((acc, item) => {
      const index = dayjs(item.date).diff(dayjs().subtract(1, "year"), "month");
      acc[index] = acc[index] || [];
      acc[index].push(item);
      return acc;
    }, []);

  const counts = commitsData.flat().map((item) => item.count);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);

  const getColor = (count) => {
    const lightness = ((count - minCount) / (maxCount - minCount)) * 70;
    return [theme[9], addHslAlpha(theme[11], lightness * 0.01)];
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
      <View style={{ marginBottom: 20 }}>
        {[...new Array(12)].map((_, index) => (
          <View key={index} style={{ flexDirection: "row" }}>
            <Text
              key={index}
              style={{
                marginVertical: 3.45,
                marginLeft: 22,
                opacity: 0.5,
                textTransform: "uppercase",
                fontFamily: "mono",
              }}
            >
              {dayjs().subtract(1, "year").add(index, "month").format("MMM")}
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                flex: 1,
                paddingHorizontal: 20,
              }}
            >
              {commitsData[index].map((item, index) => {
                const t = getColor(item.count);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.cell,
                      {
                        flex: 1,
                        aspectRatio: "1 / 1",
                        backgroundColor: t[1],
                        borderWidth: 1,
                        borderColor: item.count ? t[0] : theme[6],
                      },
                    ]}
                    onPress={() =>
                      Toast.show({
                        type: "info",
                        text1: dayjs(item.date).format("MMM D, YYYY"),
                        text2: `${item.count} ${
                          item.count === 1 ? "task" : "tasks"
                        } completed`,
                      })
                    }
                  >
                    {item.count !== 0 && (
                      <Text
                        style={{
                          fontSize: 8.5,
                          color: theme[11],
                          ...(breakpoints.md &&
                          parseFloat(
                            t[1].split(",")[3].replace?.(")", "")
                          ).toFixed(2) > parseFloat("0.5").toFixed(2)
                            ? { color: theme[1], opacity: 0.9 }
                            : {}),
                        }}
                      >
                        {breakpoints.md && item.count}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              {
                // if month is 30 days, add 1 more cell to make it 31
              }
              {commitsData[index].length < 31 &&
                [...new Array(31 - commitsData[index].length)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.cell,
                      {
                        flex: 1,
                        aspectRatio: "1 / 1",
                        backgroundColor: "transparent",
                        borderWidth: 1,
                        borderColor: "transparent",
                      },
                    ]}
                  />
                ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

