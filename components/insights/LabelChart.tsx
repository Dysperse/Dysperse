import { cardStyles } from "@/components/insights/cardStyles";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useState } from "react";
import { View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

export const LabelChart = ({ data }) => {
  const [width, setWidth] = useState(0);
  const theme = useColorTheme();
  const [showMore, setShowMore] = useState(false);
  const handleShowMore = () => setShowMore(!showMore);

  const chartConfig: AbstractChartConfig = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    color: (n = 1) => addHslAlpha(theme[11], n),
    barPercentage: 0.5,
    barRadius: 5,
    paddingRight: 0,
  };

  const colors = useLabelColors();
  const breakpoints = useResponsiveBreakpoints();

  const pieData = Object.entries(data.byLabel).map(([label, count]) => ({
    name: data.byLabel[label].label.name,
    count: data.byLabel[label].count,
    emoji: data.byLabel[label].label.emoji,
    color: colors[data.byLabel[label].label.color][11],
    legendFontColor: theme[11],
    legendFontSize: 15,
  }));

  return pieData.length === 0 ? (
    <View
      style={{
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        marginTop: 20,
        padding: 30,
        gap: 5,
      }}
    >
      <Text style={[cardStyles.title, { marginTop: 0 }]} weight={700}>
        Completed tasks by label
      </Text>
      <Text
        style={{
          fontSize: 20,
          opacity: 0.5,
        }}
        weight={300}
      >
        No labels have been used yet
      </Text>
    </View>
  ) : (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        marginTop: 20,
        flexDirection: breakpoints.md ? "row" : "column",
      }}
    >
      <View>
        <Text
          style={[cardStyles.title, { margin: 30, marginBottom: 0 }]}
          weight={700}
        >
          Completed tasks by label
        </Text>
        <PieChart
          paddingLeft="0"
          data={pieData}
          width={breakpoints.md ? Math.min(1000, width) / 2 - 20 : width}
          height={breakpoints.md ? Math.min(1000, width) / 2 - 20 : width}
          hasLegend={false}
          chartConfig={chartConfig}
          accessor={"count"}
          center={
            breakpoints.md
              ? [Math.min(1000, width) / 8.5, 0]
              : [Math.min(1000, width) / 4, 0]
          }
          backgroundColor="transparent"
          absolute
        />
      </View>
      <View
        style={{
          flex: breakpoints.md ? 1 : undefined,
          marginTop: breakpoints.md ? 100 : 0,
          justifyContent: "center",
        }}
      >
        {pieData.slice(0, showMore ? pieData.length : 7).map((label, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              paddingHorizontal: 20,
              gap: 20,
              borderBottomWidth:
                i === pieData.length - 1 || (!showMore && i === 6) ? 0 : 1,
              borderBottomColor: theme[5],
            }}
          >
            <Emoji emoji={label.emoji} size={30} />
            <Text style={{ fontSize: 20 }} weight={300}>
              {label.name}
            </Text>
            <Text style={{ marginLeft: "auto", opacity: 0.5 }} weight={700}>
              {label.count}
            </Text>
          </View>
        ))}
        {pieData.length > 5 && (
          <View style={{ padding: 10 }}>
            <Button onPress={handleShowMore} variant="outlined">
              <ButtonText>{showMore ? "Show less" : "Show more"}</ButtonText>
              <Icon>{showMore ? "expand_less" : "expand_more"}</Icon>
            </Button>
          </View>
        )}
      </View>
    </View>
  );
};
