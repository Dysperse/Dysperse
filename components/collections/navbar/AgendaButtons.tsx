import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType } from "dayjs";
import { router, useGlobalSearchParams } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { AgendaCalendarMenu } from "./AgendaCalendarMenu";

export function AgendaButtons({
  handleMenuOpen,
}: {
  handleMenuOpen?: () => void;
}) {
  const theme = useColorTheme();
  // eslint-disable-next-line prefer-const
  let { agendaView, mode, start }: any = useGlobalSearchParams();
  if (!agendaView) agendaView = mode || "week";

  const handlePrev = useCallback(async () => {
    const newParams = {
      start: dayjs(start)
        .subtract(
          agendaView === "3days" ? 3 : 1,
          agendaView === "3days"
            ? "day"
            : agendaView === "schedule"
            ? "month"
            : (agendaView as ManipulateType)
        )
        .toISOString(),
    };
    router.setParams(newParams);
  }, [agendaView, start]);

  const handleNext = useCallback(() => {
    router.setParams({
      start: dayjs(start)
        .startOf(agendaView as ManipulateType)
        .add(
          agendaView === "3days" ? 3 : 1,
          agendaView === "3days"
            ? "day"
            : agendaView === "schedule"
            ? "month"
            : (agendaView as ManipulateType)
        )
        .toISOString(),
    });
  }, [agendaView, start]);

  const handleToday = useCallback(() => {
    router.setParams({
      start: dayjs().startOf("day").utc().toISOString(),
    });
  }, []);

  useHotkeys(["ctrl+left", "ctrl+right"], (e) => {
    e.preventDefault();
    if (e.key === "ArrowLeft") handlePrev();
    else if (e.key === "ArrowRight") handleNext();
  });

  useHotkeys(["ctrl+up"], (e) => {
    e.preventDefault();
    handleToday();
  });

  const isTodaysView = dayjs().isBetween(
    dayjs(start).startOf(agendaView as ManipulateType),
    dayjs(start).endOf(agendaView as ManipulateType),
    "day",
    "[]"
  );
  const breakpoints = useResponsiveBreakpoints();

  const titleFormat = {
    week: "[Week #]W • MMM YYYY",
    month: "MMMM YYYY",
    year: "YYYY",
    schedule: "MMMM YYYY",
    "3days": "[Week #]W • MMM YYYY",
  }[((agendaView || mode) as any) || "week"];

  const trigger = (
    <Button
      onPress={handleMenuOpen}
      backgroundColors={{
        default: breakpoints.md ? "transparent" : theme[3],
        hovered: breakpoints.md ? "transparent" : theme[4],
        pressed: breakpoints.md ? "transparent" : theme[5],
      }}
      borderColors={{
        default: breakpoints.md ? "transparent" : theme[3],
        hovered: breakpoints.md ? "transparent" : theme[4],
        pressed: breakpoints.md ? "transparent" : theme[5],
      }}
    >
      <Text numberOfLines={1} weight={600}>
        {dayjs(start).format(titleFormat).split("•")?.[0]}
      </Text>
      <Text numberOfLines={1} style={{ opacity: 0.6 }}>
        {dayjs(start).format(titleFormat).split("• ")?.[1]}
      </Text>
    </Button>
  );

  return (
    <View>
      <View
        style={[
          { flexDirection: "row", gap: 10 },
          breakpoints.md
            ? { marginRight: "auto" }
            : {
                borderTopColor: theme[5],
                backgroundColor: theme[3],
                paddingHorizontal: 15,
                paddingVertical: 5,
                borderTopWidth: 1,
                flexDirection: "row-reverse",
              },
        ]}
      >
        <IconButton
          variant="text"
          onPress={handleToday}
          size={40}
          disabled={isTodaysView}
          style={[
            breakpoints.md && {
              borderRadius: 20,
              marginLeft: -40,
              marginRight: -10,
            },
            !breakpoints.md && isTodaysView && { display: "none" },
            { opacity: isTodaysView ? 0 : 1 },
          ]}
        >
          <Icon>today</Icon>
        </IconButton>
        <View
          style={[
            {
              flexDirection: "row",
              justifyContent: "space-between",
              height: 40,
              alignItems: "center",
              paddingHorizontal: 10,
            },
            breakpoints.md
              ? {
                  marginRight: !isTodaysView ? undefined : "auto",
                  borderRadius: 20,
                }
              : { flex: 1 },
          ]}
        >
          <IconButton onPress={handlePrev}>
            <Icon>west</Icon>
          </IconButton>
          {typeof handleMenuOpen === "undefined" ? (
            <MenuPopover trigger={trigger} containerStyle={{ width: 300 }}>
              <AgendaCalendarMenu />
            </MenuPopover>
          ) : (
            trigger
          )}
          <IconButton onPress={handleNext}>
            <Icon>east</Icon>
          </IconButton>
        </View>
      </View>
    </View>
  );
}
