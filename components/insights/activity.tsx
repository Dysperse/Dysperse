import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { useState } from "react";
import { View } from "react-native";
import { ContributionGraph } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

export const Activity = ({ data }) => {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const [width, setWidth] = useState(0);
  const chartConfig: AbstractChartConfig = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    color: (n = 1) => addHslAlpha(theme[9], n),
    barPercentage: 0.5,
    barRadius: 5,
    paddingRight: 0,
    useShadowColorFromDataset: false, // optional
    propsForLabels: {
      fontFamily: "body_700",
      opacity: 0.5,
      fontSize: breakpoints.md ? 16 : 12,
      translateY: breakpoints.md ? 10 : 25,
    },
  };
  const commitsData = data
    ? // must be unique days with { date: "2021-09-01", count: 1 }. There can be multiple entries for the same day, so reduce them to a single entry
      data.completionInstances
        .filter((e) => e.completedAt)
        .reduce((acc: any, item: any) => {
          const date = dayjs(item.completedAt).format("YYYY-MM-DD");
          const existing = acc.find((x: any) => x.date === date);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ date, count: 1 });
          }
          return acc;
        }, [])
    : [];

  const squareSize = (width - 20) / 52 - 2;

  return (
    <View
      style={{
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
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
      <ContributionGraph
        values={commitsData}
        tooltipDataAttrs={() => ({} as any)}
        style={{ padding: 0, marginTop: -20 }}
        endDate={new Date()}
        getMonthLabel={
          breakpoints.md ? undefined : (m) => dayjs().month(m).format("MMM")[0]
        }
        width={width}
        height={7 * (squareSize + 2) + 60}
        numDays={365}
        chartConfig={chartConfig}
        squareSize={squareSize}
        gutterSize={1}
      />
    </View>
  );
};
