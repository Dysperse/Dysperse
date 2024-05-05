import { useLabelColors } from "@/components/labels/useLabelColors";
import ContentWrapper from "@/components/layout/content";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { ProfileModal } from "@/components/ProfileModal";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Logo from "@/ui/logo";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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

const cardStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 25,
    flex: 1,
    padding: 30,
    gap: 10,
  },
  title: { fontSize: 30 },
});

const LabelChart = ({ data }) => {
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

function MemberSince() {
  const theme = useColorTheme();
  const { session } = useUser();

  return (
    <View
      style={[
        cardStyles.container,
        {
          backgroundColor: theme[3],
          borderColor: theme[5],
          marginBottom: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          padding: 20,
        },
      ]}
    >
      <LinearGradient
        colors={[theme[2], theme[1]]}
        style={{
          borderWidth: 2,
          borderColor: theme[9],
          shadowColor: theme[11],
          shadowOffset: { width: 5, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          width: 70,
          height: 70,
          borderRadius: 99,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <View style={{ marginTop: -7, marginLeft: -10 }}>
          <Logo size={50} />
        </View>
        <LinearGradient
          colors={[theme[8], theme[9]]}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 40,
            height: 70,
            marginBottom: -15,
            transform: [{ rotate: "45deg" }],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "serifText800",
              color: theme[2],
              marginLeft: -6,
              fontSize: 20,
              transform: [{ rotate: "-45deg" }],
            }}
          >
            &rsquo;{dayjs(session.createdAt).format("YY")}
          </Text>
        </LinearGradient>
      </LinearGradient>
      <Text
        style={{
          fontSize: 30,
          color: theme[11],
        }}
        weight={200}
      >
        {capitalizeFirstLetter(session?.user?.profile?.name?.split(" ")?.[0])},
        you've been a member since{" "}
        {dayjs(session.createdAt).format("MMMM YYYY")} &mdash; thank you{" "}
        <Text
          style={{
            verticalAlign: "top",
          }}
        >
          <Emoji
            emoji="1F499"
            size={25}
            style={{
              transform: [{ translateY: -5 }],
            }}
          />
        </Text>
      </Text>
    </View>
  );
}

export default function Page() {
  const { data, error } = useSWR(["user/insights"]);
  const { session } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const ref = useRef<ScrollView>(null);

  return (
    <ContentWrapper noPaddingTop>
      <Header scrollRef={ref} />
      {data ? (
        <View style={{ flex: 1 }}>
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
            <MemberSince />
            <Activity data={data} />
            <LabelChart data={data} />
            <View
              style={{
                flexDirection: breakpoints.md ? "row" : "column",
                marginTop: 20,
                gap: 20,
              }}
            >
              <HourChart data={data} />
              <DayChart data={data} />
            </View>
          </ScrollView>
        </View>
      ) : (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          {error ? <ErrorAlert /> : <Spinner />}
        </View>
      )}
    </ContentWrapper>
  );
}
