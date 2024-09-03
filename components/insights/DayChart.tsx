import jost from "@/assets/fonts/body/Jost_500Medium.ttf";
import { cardStyles } from "@/components/insights/cardStyles";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient, useFont, vec } from "@shopify/react-native-skia";
import { View } from "react-native";
import { Bar, CartesianChart } from "victory-native";

export const DayChart = ({ data }) => {
  const font = useFont(jost, 12);
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const barData = ["S", "M", "T", "W", "T", "F", "S"].map((e, i) => ({
    day: e,
    count: data.byDay[i],
  }));

  return (
    <View
      style={[
        cardStyles.container,
        {
          borderColor: theme[5],
          backgroundColor: theme[3],
        },
      ]}
    >
      <Text
        style={[{ fontSize: breakpoints.md ? 30 : 25 }, cardStyles.title]}
        weight={700}
      >
        Productivity by day
      </Text>
      <CartesianChart
        data={barData}
        xKey="day"
        yKeys={["count"]}
        domainPadding={{ left: 50, right: 50 }}
        axisOptions={{
          font,
          labelColor: theme[11],
          tickCount: 7,
          lineColor: {
            grid: {
              y: theme[5],
              x: "transparent",
            },
            frame: theme[5],
          },
        }}
      >
        {({ points, chartBounds }) => (
          <Bar
            chartBounds={chartBounds}
            points={points.count}
            barWidth={20}
            roundedCorners={{
              topLeft: 5,
              topRight: 5,
            }}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, 400)}
              colors={[theme[9], theme[6]]}
            />
          </Bar>
        )}
      </CartesianChart>
    </View>
  );
};

