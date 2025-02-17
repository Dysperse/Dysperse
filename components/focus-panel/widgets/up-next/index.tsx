import Task from "@/components/task";
import { TaskDrawer } from "@/components/task/drawer";
import { Button } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { View } from "react-native";
import useSWR from "swr";

const UpNext = ({ widget, setParam, params, menuActions }) => {
  const theme = useColorTheme();
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

  if (params.hideWhenEmpty && incomplete.length === 0) return null;

  return (
    <View>
      <MenuPopover
        menuProps={{
          style: { marginRight: "auto", marginLeft: -10 },
          rendererProps: { placement: "bottom" },
        }}
        containerStyle={{ width: 220, marginLeft: 20, marginTop: -15 }}
        options={[
          {
            renderer: () => (
              <ConfirmationModal
                title="Hide when empty?"
                secondary="You won't be able to see this widget when there are no upcoming tasks."
                onSuccess={() => setParam("hideWhenEmpty", true)}
              >
                <MenuItem>
                  <Icon>visibility</Icon>
                  <Text variant="menuItem">Hide when empty?</Text>
                </MenuItem>
              </ConfirmationModal>
            ),
          },
        ]}
        trigger={
          <Button
            dense
            textProps={{ variant: "eyebrow" }}
            text="Up next"
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
          padding: 5,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme[5],
        }}
      >
        {incomplete[0] ? (
          <>
            <Task
              showLabel
              showRelativeTime
              onTaskUpdate={() => mutate()}
              task={incomplete[0]}
            />
            {incomplete.length > 1 && (
              <Text
                weight={800}
                style={{
                  padding: 10,
                  paddingVertical: 4,
                  opacity: 0.6,
                  textAlign: "center",
                  color: theme[11],
                }}
              >
                +{incomplete.length - 1} more
              </Text>
            )}
          </>
        ) : (
          <Text>No upcoming tasks!</Text>
        )}
      </View>
    </View>
  );
};

export default UpNext;

