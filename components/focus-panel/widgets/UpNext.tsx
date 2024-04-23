import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { View } from "react-native";
import useSWR from "swr";
import { Entity } from "../../collections/entity";
import {
  ColumnEmptyComponent,
  onTaskUpdate,
} from "../../collections/views/planner/Column";
import { TaskDrawer } from "../../task/drawer";
import { ImportantChip } from "../panel";
import { widgetStyles } from "../widgetStyles";

export const UpNext = ({params}) => {
  const userTheme = useColorTheme();
  const theme = useColor("green");
  const orange = useColor("orange");
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

  const { data, mutate, error } = useSWR(
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
    {
      refreshInterval: 1000 * 60 * 1,
      refreshWhenHidden: true,
    }
  );

  const today = data?.find((col) =>
    dayjs().isBetween(dayjs(col.start), dayjs(col.end))
  );

  // find task which is closest in future to current time
  const nextTask = today?.tasks
    .filter((task) => dayjs().isBefore(dayjs(task.due)))
    .filter((t) => t.completionInstances?.length === 0)
    .sort((a, b) => dayjs(a.due).diff(dayjs(b.due)))[0];

  const nextUncompletedTask = today?.tasks
    .sort((a, b) => dayjs(a.due).diff(dayjs(b.due)))
    .filter((t) => t.completionInstances?.length === 0);

  return (
    <View>
      <Text variant="eyebrow" style={{ marginBottom: 10 }}>
        Up next
      </Text>
      <ColorThemeProvider theme={theme}>
        {error && <ErrorAlert />}
        <View
          style={[
            widgetStyles.card,
            {
              backgroundColor: theme[2],
              borderWidth: 1,
              borderColor: theme[4],
            },
          ]}
        >
          {data ? (
            <>
              {nextTask ? (
                <>
                  <View
                    style={{ flexDirection: "row", marginBottom: 5, gap: 10 }}
                  >
                    {nextTask.label && (
                      <Chip
                        disabled
                        dense
                        label={
                          nextTask.label.name.length > 10
                            ? `${nextTask.label.name.slice(0, 10)}...`
                            : `${nextTask.label.name}`
                        }
                        icon={<Emoji size={17} emoji={nextTask.label.emoji} />}
                        style={{
                          paddingHorizontal: 10,
                        }}
                      />
                    )}
                    {nextTask.pinned && <ImportantChip />}
                  </View>
                  <Text style={{ fontSize: 35 }}>{nextTask.name}</Text>
                  <Text
                    style={{
                      fontFamily: "mono",
                      marginTop: 5,
                    }}
                  >
                    {dayjs(nextTask.due).fromNow()}
                  </Text>
                  <ColorThemeProvider theme={userTheme}>
                    <TaskDrawer
                      id={nextTask.id}
                      mutateList={(n) => onTaskUpdate(n, mutate, today)}
                    >
                      <Button
                        style={({ pressed, hovered }) => ({
                          backgroundColor:
                            theme[pressed ? 11 : hovered ? 10 : 9],
                          marginTop: 10,
                        })}
                      >
                        <ButtonText style={{ color: theme[1] }} weight={900}>
                          View task
                        </ButtonText>
                        <Icon bold style={{ color: theme[1] }}>
                          north_east
                        </Icon>
                      </Button>
                    </TaskDrawer>
                  </ColorThemeProvider>
                </>
              ) : (
                <View>
                  {nextUncompletedTask.length > 0 ? (
                    <View style={{ marginTop: 10, marginHorizontal: -10 }}>
                      <Text
                        style={{
                          paddingHorizontal: 10,
                          marginBottom: 10,
                          textAlign: "center",
                        }}
                        variant="eyebrow"
                      >
                        You didn't finish...
                      </Text>
                      {nextUncompletedTask.slice(0, 3).map((task) => (
                        <Entity
                          isReadOnly={false}
                          key={task.id}
                          item={task}
                          onTaskUpdate={(n) => onTaskUpdate(n, mutate, today)}
                          showLabel
                          showRelativeTime
                        />
                      ))}
                    </View>
                  ) : (
                    <>
                      <Text
                        variant="eyebrow"
                        style={{
                          textAlign: "center",
                          marginTop: 10,
                        }}
                      >
                        No tasks today! 🎉
                      </Text>
                      <View
                        style={{
                          marginTop: -30,
                          marginBottom: 10,
                        }}
                      >
                        <ColumnEmptyComponent dense />
                      </View>
                    </>
                  )}
                </View>
              )}
            </>
          ) : (
            <Spinner />
          )}
        </View>
      </ColorThemeProvider>
    </View>
  );
};
