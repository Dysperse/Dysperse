import { useLabelColors } from "@/components/labels/useLabelColors";
import ContentWrapper from "@/components/layout/content";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { ProfileModal } from "@/components/ProfileModal";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ProfilePicture } from "@/ui/Avatar";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
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

const Activity = ({ data }) => {
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
        style={{ padding: 0, marginTop: -30 }}
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

const Co2 = ({ data }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        flex: 2,
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="eyebrow" weight={900}>
          By using #dysperse, you've saved
        </Text>
        <Text style={{ fontSize: breakpoints.md ? 45 : 35 }} weight={700}>
          {(data?.co2 || 0).toFixed(2)} grams of CO
          <Text style={{ fontSize: 18 }} weight={300}>
            2
          </Text>
          <IconButton
            icon={<Icon style={{ fontSize: 20 }}>info</Icon>}
            style={{ opacity: 0.5, marginLeft: 10 }}
            onPress={() =>
              Toast.show({
                type: "info",
                text1:
                  "CO2 is measured by taking all of your tasks and listing them on traditional notebook paper (1 line per task). The amount of CO2 saved is calculated by the amount of paper you would've used.",
              })
            }
          />
        </Text>
        <Text
          style={{ fontSize: 20, opacity: 0.5, marginTop: -3 }}
          weight={500}
        >
          from being polluted into the atmosphere
        </Text>
      </View>
    </View>
  );
};

const TasksCreated = ({ data }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        flex: breakpoints.md ? 1 : undefined,
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        padding: 20,
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

const LabelChart = ({ data }) => {
  const [width, setWidth] = useState(0);
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
  const breakpoints = useResponsiveBreakpoints();

  const pieData = Object.entries(data.byLabel).map(([label, count]) => ({
    name: data.byLabel[label].label.name,
    count: data.byLabel[label].count,
    emoji: data.byLabel[label].label.emoji,
    color: colors[data.byLabel[label].label.color][11],
    legendFontColor: theme[11],
    legendFontSize: 15,
  }));

  return (
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
      <View style={{ flex: breakpoints.md ? 1 : undefined }}>
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
          width={breakpoints.md ? width / 2 - 20 : width}
          height={breakpoints.md ? width / 2 - 20 : width}
          hasLegend={false}
          chartConfig={chartConfig}
          accessor={"count"}
          center={breakpoints.md ? [width / 8.5, 0] : [width / 4, 0]}
          backgroundColor="transparent"
          absolute
        />
      </View>
      <View
        style={{
          flex: breakpoints.md ? 1 : undefined,
          marginTop: breakpoints.md ? 70 : 0,
        }}
      >
        {pieData.map((label, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              paddingHorizontal: 20,
              gap: 20,
              borderBottomWidth: i === pieData.length - 1 ? 0 : 1,
              borderBottomColor: theme[5],
            }}
          >
            <Emoji emoji={label.emoji} size={20} />
            <Text style={{ fontSize: 20 }} weight={300}>
              {label.name}
            </Text>
            <Text style={{ marginLeft: "auto", opacity: 0.5 }} weight={700}>
              {label.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const barDefaultProps = {
  showBarTops: false,
  fromZero: true,
  xAxisLabel: "",
  yAxisLabel: "",
  yAxisSuffix: "",
  flatColor: true,
  withCustomBarColorFromData: true,
  style: {
    paddingRight: 0,
    height: 320,
  },
};
const HourChart = ({ data }) => {
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
      style={{
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        flex: 1,
        padding: 20,
        gap: 10,
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Text
        style={{
          fontSize: breakpoints.md ? 30 : 25,
        }}
        weight={700}
      >
        Productivity by hour
      </Text>
      <BarChart
        {...barDefaultProps}
        data={barData}
        width={width - 40}
        height={350}
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

const DayChart = ({ data }) => {
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
      style={{
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        padding: 20,
        flex: 1,
        gap: 10,
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Text
        style={{
          fontSize: breakpoints.md ? 30 : 25,
        }}
        weight={700}
      >
        Productivity by day
      </Text>
      <BarChart
        {...barDefaultProps}
        data={barData}
        width={width - 40}
        height={350}
        withHorizontalLabels={false}
        chartConfig={chartConfig}
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
          <ScrollView
            contentContainerStyle={{ padding: breakpoints.md ? 30 : 20 }}
            ref={ref}
          >
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
                marginTop: 20,
                gap: 20,
              }}
            >
              <HourChart width={width} data={data} />
              <DayChart width={width} data={data} />
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
