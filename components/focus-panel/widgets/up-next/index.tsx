import { TaskDrawer } from "@/components/task/drawer";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import useSWR from "swr";

const UpNext = ({ widget, menuActions }) => {
  const theme = useColor("green");
  const [todayDateString, setTodayDateString] = useState(dayjs().toISOString());

  useEffect(() => {
    const interval = setInterval(
      () => {
        setTodayDateString(dayjs().toISOString());
      },
      // every 5 minutes
      1000 * 60 * 5
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // check if the day has changed every 5 seconds and update the date string if it has
    const interval = setInterval(() => {
      if (!dayjs().isSame(dayjs(todayDateString), "day")) {
        setTodayDateString(dayjs().toISOString());
      }
    }, 1000 * 5);
    return () => clearInterval(interval);
  }, [todayDateString]);

  const { data, mutate } = useSWR(
    [
      "space/collections/collection/planner",
      {
        all: true,
        start: dayjs(todayDateString).startOf("week").toISOString(),
        end: dayjs(todayDateString).endOf("week").toISOString(),
        type: "week",
        timezone: dayjs.tz.guess(),
        id: "-",
      },
    ],
    { refreshInterval: 1000 * 60 * 1 }
  );

  const today = data?.find((col) =>
    dayjs().isBetween(dayjs(col.start), dayjs(col.end))
  );

  // find task which is closest in future to current time
  const incomplete = Object.values(today?.entities || {})
    .filter((task) => task.completionInstances.length === 0)
    .sort((a, b) => {
      return dayjs(a.start).diff(dayjs(b.start));
    });

  const SafeModal = incomplete[0]
    ? (t) => (
        <TaskDrawer id={incomplete[0]?.id} mutateList={() => mutate()} {...t} />
      )
    : View;

  return (
    <SafeModal>
      <IconButton
        style={{ borderRadius: 20, height: "auto", width: "100%" }}
        backgroundColors={{
          default: theme[4],
          pressed: theme[5],
          hovered: theme[6],
        }}
        size={"auto"}
        pressableStyle={{
          alignItems: "flex-start",
          padding: 10,
          justifyContent: "space-between",
        }}
      >
        {incomplete[0]?.pinned && (
          <View
            style={{ flexDirection: "row", alignItems: "center", opacity: 0.6 }}
          >
            <Text style={{ fontSize: 10, color: theme[11] }} weight={900}>
              URGENT
            </Text>
          </View>
        )}

        <Text
          weight={800}
          style={[
            {
              fontSize: 15,
              lineHeight: 17,
              color: theme[11],
              paddingTop: Platform.OS === "ios" ? 1 : 0,
            },
            incomplete.length === 0 && { textAlign: "center" },
          ]}
          numberOfLines={4}
        >
          {incomplete[0] ? incomplete[0].name : "That's all for now!"}
        </Text>

        {incomplete.length > 1 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              opacity: 0.6,
              marginTop: 2,
            }}
          >
            <Text style={{ fontSize: 13, color: theme[11] }}>
              +{incomplete.length - 1} more
            </Text>
          </View>
        )}
      </IconButton>
    </SafeModal>
  );
};

export default UpNext;

