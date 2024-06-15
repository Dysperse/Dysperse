import { cardStyles } from "@/components/insights/cardStyles";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Text, { getFontName } from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useState } from "react";
import { View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { barDefaultProps } from "./barDefaultProps";

export const DayChart = ({ data }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const [width, setWidth] = useState(400);
  const chartConfig: AbstractChartConfig = {
    color: (n = 1) => addHslAlpha(theme[11], n),
    barPercentage: breakpoints.md ? 0.5 : 0.2,
    propsForVerticalLabels: {
      fontFamily: getFontName("jost", 500),
      fontSize: 11,
    },
    barRadius: 5,
  };

  const barData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) =>
      day.slice(0, breakpoints.md ? undefined : 1)
    ),
    datasets: [
      {
        data: data.byDay,
        colors: new Array(data.byDay).fill(() => theme[7]),
      },
    ],
  };

  return (
    <View
      style={[
        cardStyles.container,
        {
          backgroundColor: theme[3],
          borderColor: theme[5],
        },
      ]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Text
        style={[{ fontSize: breakpoints.md ? 30 : 25 }, cardStyles.title]}
        weight={700}
      >
        Productivity by day
      </Text>
      <BarChart
        {...barDefaultProps}
        data={barData}
        width={width - 60}
        height={370}
        withHorizontalLabels={false}
        chartConfig={chartConfig}
      />
    </View>
  );
};
