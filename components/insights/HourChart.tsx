import { barDefaultProps } from "@/components/insights/barDefaultProps";
import { cardStyles } from "@/components/insights/cardStyles";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useState } from "react";
import { View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

export const HourChart = ({ data }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const [width, setWidth] = useState(400);
  const chartConfig: AbstractChartConfig = {
    color: (n = 1) => addHslAlpha(theme[11], n),
    barPercentage: breakpoints.md ? 0.5 : 0.2,
    propsForVerticalLabels: {
      fontFamily: "body_500",
      fontSize: 11,
    },
    barRadius: 5,
  };

  const barData = {
    labels: [
      "12AM",
      "1AM",
      "2AM",
      "3AM",
      "4AM",
      "5AM",
      "6AM",
      "7AM",
      "8AM",
      "9AM",
      "10AM",
      "11AM",
      "12PM",
      "1PM",
      "2PM",
      "3PM",
      "4PM",
      "5PM",
      "6PM",
      "7PM",
      "8PM",
      "9PM",
      "10PM",
      "11PM",
    ],
    datasets: [
      {
        data: data.byHour,
        colors: new Array(data.byHour.length).fill(() => theme[7]),
      },
    ],
  };

  return (
    <View
      style={[
        cardStyles.container,
        {
          borderColor: theme[5],
          backgroundColor: theme[3],
        },
      ]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Text
        style={[{ fontSize: breakpoints.md ? 30 : 25 }, cardStyles.title]}
        weight={700}
      >
        Productivity by hour
      </Text>
      <BarChart
        {...barDefaultProps}
        data={barData}
        width={width - 60}
        height={370}
        withHorizontalLabels={false}
        chartConfig={chartConfig}
        hidePointsAtIndex={
          breakpoints.md
            ? [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21, 22]
            : [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19,
                20, 21, 22,
              ]
        }
      />
    </View>
  );
};
