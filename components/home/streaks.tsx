import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router } from "expo-router";
import { View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { TouchableOpacity } from "react-native-gesture-handler";
import useSWR from "swr";

const GoalIndicator = ({ completed, goal, name }) => {
  const theme = useColorTheme();

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: 20, flex: 1 }}
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
  const { data, error } = useSWR([
    "user/streaks",
    {
      dayStart: dayjs().startOf("day").utc().toISOString(),
      weekStart: dayjs().startOf("week").utc().toISOString(),
    },
  ]);

  return (
    <>
      <View
        style={[
          { flexDirection: "row", justifyContent: "space-between" },
          !breakpoints.md && { marginTop: 20 },
        ]}
      >
        <Text variant="eyebrow" style={{ marginBottom: 10 }}>
          Goals
        </Text>
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
          flexDirection: "row",
          alignItems: "center",
          height: 80,
          justifyContent: "center",
        }}
      >
        {data ? (
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
        ) : (
          <Spinner />
        )}
      </View>
    </>
  );
}
