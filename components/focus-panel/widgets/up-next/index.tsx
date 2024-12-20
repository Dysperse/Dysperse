import { ColumnEmptyComponent } from "@/components/collections/emptyComponent";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text, { getFontName } from "@/ui/Text";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { View } from "react-native";
import useSWR from "swr";
import { Entity } from "../../../collections/entity";
import { onTaskUpdate } from "../../../collections/views/planner/Column";
import { TaskDrawer } from "../../../task/drawer";
import { useFocusPanelContext } from "../../context";
import { ImportantChip, UpcomingSvg } from "../../panel";
import { widgetMenuStyles } from "../../widgetMenuStyles";
import { widgetStyles } from "../../widgetStyles";

const UpNext = ({ widget, menuActions }) => {
  const userTheme = useColorTheme();
  const theme = useColor("green");
  const { panelState, setPanelState } = useFocusPanelContext();
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
    { refreshInterval: 1000 * 60 * 1 }
  );

  const today = data?.find((col) =>
    dayjs().isBetween(dayjs(col.start), dayjs(col.end))
  );

  // find task which is closest in future to current time
  const nextTask = Object.values(today?.tasks || {})
    .filter((task) => dayjs().isBefore(dayjs(task.start)))
    .filter((t) => t.completionInstances?.length === 0)
    .sort((a, b) => dayjs(a.start).diff(dayjs(b.start)))[0];

  const nextUncompletedTask = Object.values(today?.tasks || {})
    .sort((a, b) => dayjs(a.start).diff(dayjs(b.start)))
    .filter((t) => t.completionInstances?.length === 0);

  return panelState === "COLLAPSED" ? (
    <IconButton
      variant="outlined"
      size={80}
      style={{ borderRadius: 20 }}
      backgroundColors={{
        default: theme[3],
        pressed: theme[4],
        hovered: theme[5],
      }}
      onPress={() => setPanelState("OPEN")}
    >
      <UpcomingSvg />
    </IconButton>
  ) : (
    <View>
      <MenuPopover
        options={menuActions}
        containerStyle={{ marginTop: -15 }}
        trigger={
          <Button style={widgetMenuStyles.button} dense>
            <ButtonText weight={800} style={widgetMenuStyles.text}>
              Up Next
            </ButtonText>
            <Icon style={{ color: theme[11] }}>expand_more</Icon>
          </Button>
        }
      />
      <ColorThemeProvider theme={theme}>
        {error && <ErrorAlert />}
        <View
          style={[
            widgetStyles.card,
            { backgroundColor: addHslAlpha(theme[4], 0.5) },
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
                  <Text style={{ fontSize: 20 }}>{nextTask.name}</Text>
                  <Text
                    style={{
                      fontFamily: getFontName("jetBrainsMono", 500),
                      marginTop: 5,
                    }}
                  >
                    {dayjs(nextTask.start).fromNow()}
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
                        })}
                        containerStyle={{ marginTop: 15 }}
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
                  {nextUncompletedTask?.length > 0 ? (
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
                          marginVertical: 30,
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

export default UpNext;

