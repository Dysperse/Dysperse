import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router } from "expo-router";
import { memo } from "react";
import { View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import useSWR from "swr";

const GoalIndicator = ({ completed, goal, name }) => {
  const theme = useColorTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        flex: 1,
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

function StreakGoal() {
  const theme = useColorTheme();

  const { data, error } = useSWR([
    "user/streaks",
    {
      weekStart: dayjs().startOf("week").utc().toISOString(),
      dayStart: dayjs().startOf("day").utc().toISOString(),
    },
  ]);

  return (
    <View>
      {error ? (
        <ErrorAlert />
      ) : (
        <>
          <MenuPopover
            menuProps={{ style: { marginRight: "auto", marginLeft: -10 } }}
            options={[
              {
                icon: "settings",
                text: "Edit goal",
                callback: () => router.push("/settings/tasks"),
              },
            ]}
            trigger={
              <Button
                dense
                textProps={{ variant: "eyebrow" }}
                text="Streaks"
                icon="expand_more"
                iconPosition="end"
                containerStyle={{ marginBottom: 5 }}
                iconStyle={{ opacity: 0.6 }}
              />
            }
          />
          <View
            style={{
              backgroundColor: theme[2],
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme[5],
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
            }}
          >
            {data ? (
              <>
                <GoalIndicator
                  name="Today"
                  completed={data.dayTasks || 0}
                  goal={data.user?.dailyStreakGoal || 5}
                />
                <GoalIndicator
                  name="This week"
                  completed={data.weekTasks || 0}
                  goal={data.user?.weeklyStreakGoal || 5}
                />
              </>
            ) : (
              <Spinner />
            )}
          </View>
        </>
      )}
    </View>
  );
}

export default memo(StreakGoal);

