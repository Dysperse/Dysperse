import ContentWrapper from "@/components/layout/content";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { useState } from "react";
import { View } from "react-native";
import { ContributionGraph } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

const Activity = ({ width, data }) => {
  const theme = useColorTheme();
  const chartConfig: AbstractChartConfig = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    color: (n = 1) => addHslAlpha(theme[11], n),
    barPercentage: 0.5,
    barRadius: 5,
    paddingRight: 0,
    useShadowColorFromDataset: false, // optional
  };
  const commitsData = data
    ? // must be unique days with { date: "2021-09-01", count: 1 }. There can be multiple entries for the same day, so reduce them to a single entry
      data.completionInstances.reduce((acc: any, item: any) => {
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

  const squareSize = (width - 90) / 52 - 2;

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
        style={{ fontSize: 20, marginTop: 20, marginLeft: 20 }}
        weight={900}
      >
        {data.completionInstances.length}{" "}
        {data.completionInstances.length === 1 ? "task" : "tasks"} completed in
        the last year
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {Array.from({ length: 12 }, (_, i) =>
          dayjs().subtract(i, "month").format("MMM")
        )
          .reverse()
          .map((month, i) => (
            <Text
              key={month}
              style={{
                paddingHorizontal: 30,
                fontSize: 12,
                marginBottom: -10,
                marginTop: 10,
                minWidth: 0,
              }}
              weight={900}
              numberOfLines={1}
            >
              {month}
            </Text>
          ))}
      </View>
      <ContributionGraph
        values={commitsData}
        style={{ padding: 0, marginTop: -30 }}
        endDate={new Date()}
        showMonthLabels={false}
        width={width - 90}
        height={7 * (squareSize + 2) + 60}
        numDays={365}
        chartConfig={chartConfig}
        squareSize={squareSize}
        gutterSize={1}
      />
    </View>
  );
};

const Co2 = ({ data }) => {
  const theme = useColorTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        padding: 20,
        marginTop: 20,
      }}
    >
      <Text variant="eyebrow" weight={900}>
        By using #dysperse, you've saved
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Text style={{ fontSize: 45 }} weight={300}>
          {(data?.co2 || 0).toFixed(2)} grams of CO
        </Text>
        <Text style={{ fontSize: 23 }} weight={300}>
          2
        </Text>
      </View>
      <Text style={{ fontSize: 20, opacity: 0.5, marginTop: -3 }} weight={500}>
        from being polluted into the atmosphere
      </Text>
    </View>
  );
};

export default function Page() {
  const { data, error } = useSWR(["user/insights"]);
  const [width, setWidth] = useState(0);

  return (
    <ContentWrapper noPaddingTop>
      <View
        style={{ flex: 1 }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        <ScrollView contentContainerStyle={{ padding: 30 }}>
          <Text
            style={{ fontSize: 40, marginBottom: 10, textAlign: "center" }}
            weight={900}
          >
            Insights
          </Text>
          <View style={{ flexDirection: "row", marginBottom: 20, gap: 20 }}>
            <Co2 data={data} />
            <Co2 data={data} />
          </View>
          <Activity width={width} data={data} />
          <Text style={{ fontFamily: "mono" }}>
            {JSON.stringify(data, null, 2)}
          </Text>
        </ScrollView>
      </View>
    </ContentWrapper>
  );
}
