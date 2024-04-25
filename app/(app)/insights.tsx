import { useLabelColors } from "@/components/labels/useLabelColors";
import ContentWrapper from "@/components/layout/content";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { ProfileModal } from "@/components/ProfileModal";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ProfilePicture } from "@/ui/Avatar";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { BarChart, ContributionGraph, PieChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const Activity = ({ width, data }) => {
  const theme = useColorTheme();
  const chartConfig: AbstractChartConfig = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    color: (n = 1) => addHslAlpha(theme[9], n),
    barPercentage: 0.5,
    barRadius: 5,
    paddingRight: 0,
    useShadowColorFromDataset: false, // optional
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
        style={{
          fontSize: 30,
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
              weight={400}
              numberOfLines={1}
            >
              {month}
            </Text>
          ))}
      </View>
      <ContributionGraph
        values={commitsData}
        tooltipDataAttrs={(value) => ({} as any)}
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
        flex: 2,
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        padding: 20,
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text variant="eyebrow" weight={900}>
          By using #dysperse, you've saved
        </Text>
        <Text style={{ fontSize: 45 }} weight={700}>
          {(data?.co2 || 0).toFixed(2)} grams of CO
          <Text style={{ fontSize: 18 }} weight={300}>
            2
          </Text>
        </Text>
        <Text
          style={{ fontSize: 20, opacity: 0.5, marginTop: -3 }}
          weight={500}
        >
          from being polluted into the atmosphere
        </Text>
      </View>
      <IconButton
        icon="help"
        onPress={() =>
          Toast.show({
            type: "info",
            text1:
              "CO2 is measured by taking all of your tasks and listing them on traditional notebook paper (1 line per task). The amount of CO2 saved is calculated by the amount of paper you would've used.",
          })
        }
      />
    </View>
  );
};

const TasksCreated = ({ data }) => {
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
      <Text style={{ fontSize: 70, fontFamily: "mono", textAlign: "center" }}>
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

function Header({ scrollRef }) {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const { openSidebar } = useSidebarContext();

  const handleBack = (e) => {
    e.stopPropagation();
    if (breakpoints.md) router.replace("/");
    else openSidebar();
  };

  return (
    <Pressable onPress={() => scrollRef.current?.scrollTo({ y: 0 })}>
      <LinearGradient
        colors={[theme[2], theme[3]]}
        style={{
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: theme[5],
          flexDirection: "row",
          zIndex: 9,
          height: 64,
        }}
      >
        <IconButton
          icon={
            <View
              style={{ alignItems: "center", flexDirection: "row", gap: 15 }}
            >
              <Icon style={{ opacity: 0.6 }}>
                {breakpoints.md ? "arrow_back_ios_new" : "menu"}
              </Icon>
              {breakpoints.md && <Text variant="eyebrow">Home</Text>}
            </View>
          }
          onPress={handleBack}
          style={{
            position: "absolute",
            left: 15,
            top: insets.top + 15,
          }}
        />
      </LinearGradient>
    </Pressable>
  );
}

const LabelChart = ({ width, data }) => {
  const theme = useColorTheme();
  const chartConfig: AbstractChartConfig = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    color: (n = 1) => addHslAlpha(theme[11], n),
    barPercentage: 0.5,
    barRadius: 5,
    paddingRight: 0,
  };

  const colors = useLabelColors();

  const pieData = Object.entries(data.byLabel).map(([label, count]) => ({
    name: data.byLabel[label].label.name,
    count: data.byLabel[label].count,
    color: colors[data.byLabel[label].label.color][11],
    legendFontColor: theme[11],
    legendFontSize: 15,
  }));

  return (
    <View
      style={{
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        marginTop: 20,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          marginTop: 20,
          marginBottom: 5,
          marginLeft: 22,
        }}
        weight={700}
      >
        Completed tasks by label
      </Text>
      <PieChart
        paddingLeft="0"
        data={pieData}
        width={width}
        height={480}
        chartConfig={chartConfig}
        accessor={"count"}
        backgroundColor={"transparent"}
        absolute
      />
    </View>
  );
};

const HourChart = ({ width, data }) => {
  const theme = useColorTheme();
  const chartConfig: AbstractChartConfig = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    color: (n = 1) => addHslAlpha(theme[11], n),
    barPercentage: 0.5,
    barRadius: 5,
    paddingRight: 0,
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
    ],
    datasets: [
      {
        data: data.byHour,
      },
    ],
  };

  return (
    <View
      style={{
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        padding: 20,
        marginTop: 20,
      }}
    >
      <BarChart
        style={{}}
        data={barData}
        width={width / 2 - 90}
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={40}
      />
    </View>
  );
};

export default function Page() {
  const { data, error } = useSWR(["user/insights"]);
  const [width, setWidth] = useState(0);
  const { session } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const ref = useRef<ScrollView>(null);

  return (
    <ContentWrapper noPaddingTop>
      {data ? (
        <View
          style={{ flex: 1 }}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
          <Header scrollRef={ref} />
          <ScrollView contentContainerStyle={{ padding: 30 }} ref={ref}>
            <View style={{ marginVertical: 50 }}>
              <Text
                style={{
                  fontSize: 50,
                  marginBottom: 10,
                  textAlign: "center",
                }}
                weight={900}
              >
                Insights
              </Text>
              <ProfileModal email={session.user.email}>
                <TouchableOpacity
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <ProfilePicture
                    name={session.user.profile.name}
                    image={session.user.profile.picture}
                    size={40}
                  />
                  <Text
                    style={{ fontSize: 23, marginLeft: 10, marginTop: 5 }}
                    weight={900}
                  >
                    {session.user.profile.name}
                  </Text>
                </TouchableOpacity>
              </ProfileModal>
            </View>
            <View
              style={{
                flexDirection: breakpoints.md ? "row" : "column",
                marginBottom: 20,
                gap: 20,
              }}
            >
              <Co2 data={data} />
              <TasksCreated data={data} />
            </View>
            <Activity width={width} data={data} />
            <LabelChart width={width} data={data} />
            <View
              style={{
                flexDirection: breakpoints.md ? "row" : "column",
                marginBottom: 20,
                gap: 20,
              }}
            >
              <HourChart width={width} data={data} />
              <HourChart width={width} data={data} />
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          {error ? <ErrorAlert /> : <Spinner />}
        </View>
      )}
    </ContentWrapper>
  );
}
