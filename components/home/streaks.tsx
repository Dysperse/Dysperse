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

const GoalIndicator = ({ dense, completed, goal, name }) => {
  const theme = useColorTheme();

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: dense ? 8 : 20,
          flex: dense ? undefined : 1,
        },
      ]}
    >
      <View
        style={{
          width: dense ? 20 : 30,
          height: dense ? 20 : 30,
          transform:
            completed >= goal ? [] : [{ rotate: "90deg" }, { scaleX: -1 }],
        }}
      >
        {/* weird bug */}
        {completed >= goal ? (
          <Avatar
            disabled
            icon="check"
            size={dense ? 20 : 30}
            style={{
              backgroundColor: theme[10],
            }}
            iconProps={{
              bold: true,
              size: dense ? 15 : undefined,
              style: { color: theme[1], marginTop: dense ? -3 : undefined },
            }}
          />
        ) : (
          <AnimatedCircularProgress
            size={dense ? 20 : 30}
            width={2}
            fill={(completed / goal) * 100}
            tintColor={theme[10]}
            backgroundColor={theme[6]}
          />
        )}
      </View>
      <View>
        <Text
          weight={900}
          style={[{ color: theme[11] }, dense && { fontSize: 10 }]}
        >
          {name}
        </Text>
        <Text
          style={[{ color: theme[11], opacity: 0.6 }, dense && { fontSize: 8 }]}
        >
          {completed}/{goal} tasks
        </Text>
      </View>
    </View>
  );
};

function StreakGoal({ dense }: { dense?: boolean }) {
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
          {!dense && (
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
          )}
          <View
            style={[
              !dense
                ? {
                    backgroundColor: theme[2],
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme[5],
                    padding: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 20,
                  }
                : {
                    marginTop: 10,
                    marginBottom: 10,
                    gap: 25,
                    flexDirection: "row",
                  },
            ]}
          >
            {data && process.env.NODE_ENV !== "production" ? (
              <>
                <GoalIndicator
                  dense={dense}
                  name="Today"
                  completed={data.dayTasks || 0}
                  goal={data.user?.dailyStreakGoal || 5}
                />
                <GoalIndicator
                  dense={dense}
                  name={dense ? "Week" : "This week"}
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
