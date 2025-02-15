import { TaskDrawer } from "@/components/task/drawer";
import { Button } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
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
      <SafeModal>
        <IconButton
          style={{
            borderRadius: 20,
            height: "auto",
            width: "100%",
            opacity: 1,
          }}
          backgroundColors={{
            default: theme[2],
            pressed: theme[3],
            hovered: theme[4],
          }}
          disabled={!incomplete[0]}
          borderColors={{
            default: theme[5],
            pressed: theme[5],
            hovered: theme[5],
          }}
          size={80}
          pressableStyle={{
            alignItems: "center",
            padding: 10,
            borderRadius: 20,
            justifyContent: "space-between",
          }}
        >
          {incomplete[0]?.pinned && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                opacity: 0.6,
              }}
            >
              <Text style={{ fontSize: 10, color: theme[11] }} weight={900}>
                URGENT
              </Text>
            </View>
          )}

          <Text
            weight={incomplete[0] ? 800 : 300}
            style={[
              {
                fontSize: 15,
                color: theme[11],
                width: "100%",
              },
              !incomplete[0] && { marginVertical: "auto", opacity: 0.5 },
              incomplete.length === 0 && { textAlign: "center" },
            ]}
            numberOfLines={4}
          >
            {incomplete[0]
              ? incomplete[0].name
              : "You don't have any upcoming tasks  🎉"}
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
    </View>
  );
};

export default UpNext;

