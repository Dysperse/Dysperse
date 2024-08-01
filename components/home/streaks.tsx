import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router } from "expo-router";
import { Platform, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { TouchableOpacity } from "react-native-gesture-handler";
import useSWR from "swr";
import { useContentWrapperContext } from "../layout/content";

const GoalIndicator = ({ completed, goal, name }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { width } = useContentWrapperContext();
  const desktop = breakpoints.md && width > 1000;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        flex: desktop ? 1 : undefined,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          transform:
            completed >= goal ? null : [{ rotate: "90deg" }, { scaleX: -1 }],
        }}
      >
        {completed >= goal ? (
          <Avatar
            disabled
            icon="check"
            size={30}
            style={{
              backgroundColor: theme[10],
            }}
            iconProps={{
              bold: true,
              style: { color: theme[1] },
            }}
          />
        ) : (
          <AnimatedCircularProgress
            size={30}
            width={2}
            fill={(completed / goal) * 100}
            tintColor={theme[10]}
            onAnimationComplete={() => console.log("onAnimationComplete")}
            backgroundColor={theme[6]}
          />
        )}
      </View>
      <View>
        <Text weight={900} style={{ color: theme[11] }}>
          {name}
        </Text>
        <Text style={{ color: theme[11], opacity: 0.6 }}>
          {completed}/{goal} tasks
        </Text>
      </View>
    </View>
  );
};

export function StreakGoal() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { width, height } = useContentWrapperContext();

  const { data, error } = useSWR([
    "user/streaks",
    {
      weekStart: dayjs().startOf("week").utc().toISOString(),
      dayStart: dayjs().startOf("day").utc().toISOString(),
    },
  ]);

  const desktop = breakpoints.md && width > 1000;

  return error ? (
    <ErrorAlert />
  ) : (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: breakpoints.md ? 10 : 20,
        }}
      >
        <Text variant="eyebrow">Goals</Text>
        <TouchableOpacity onPress={() => router.push("/settings/account")}>
          <Icon style={{ opacity: 0.6, marginRight: 10 }} size={20}>
            tune
          </Icon>
        </TouchableOpacity>
      </View>
      <View
        style={{
          backgroundColor: theme[2],
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme[5],
          marginBottom: 30,
          padding: 20,
          flexDirection: desktop ? "row" : "column",
          alignItems: desktop ? "center" : "flex-start",
          height: desktop ? 80 : undefined,
          gap: desktop ? undefined : 20,
          justifyContent: "center",
        }}
      >
        {data ? (
          !(
            process.env.NODE_ENV === "development" && Platform.OS === "android"
          ) && (
            <>
              <GoalIndicator
                name="Daily goal"
                completed={data.dayTasks || 0}
                goal={data.user?.dailyStreakGoal || 5}
              />
              <GoalIndicator
                name="Weekly goal"
                completed={data.weekTasks || 0}
                goal={data.user?.weeklyStreakGoal || 5}
              />
            </>
          )
        ) : (
          <Spinner />
        )}
      </View>
    </>
  );
}
