import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType } from "dayjs";
import { router, useGlobalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { View } from "react-native";
import { AgendaCalendarMenu } from "./AgendaCalendarMenu";

export function AgendaButtons({
  handleMenuOpen,
  weekMode,
}: {
  handleMenuOpen?: () => void;
  weekMode?: boolean;
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
          weekMode
            ? agendaView === "3days"
              ? "day"
              : agendaView === "schedule"
              ? "month"
              : (agendaView as ManipulateType)
            : "days"
        )
        .toISOString(),
    };
    router.setParams(newParams);
  }, [agendaView, start, weekMode]);

  const handleNext = useCallback(() => {
    const t = weekMode
      ? dayjs(start).startOf(agendaView as ManipulateType)
      : dayjs(start);

    router.setParams({
      start: t
        .add(
          agendaView === "3days" ? 3 : 1,
          weekMode
            ? agendaView === "3days"
              ? "day"
              : agendaView === "schedule"
              ? "month"
              : (agendaView as ManipulateType)
            : "days"
        )
        .toISOString(),
    });
  }, [agendaView, start, weekMode]);

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
    dayjs(start).endOf(weekMode ? (agendaView as ManipulateType) : "day"),
    "day",
    "[]"
  );
  const breakpoints = useResponsiveBreakpoints();

  const titleFormat = weekMode ? "[Week #]W • MMM YYYY" : "MMM Do [& after]";

  const trigger = (
    <Button
      onPress={handleMenuOpen}
      height={45}
      backgroundColors={{
        default: breakpoints.md ? addHslAlpha(theme[8], 0) : theme[3],
        hovered: breakpoints.md ? addHslAlpha(theme[8], 0.15) : theme[4],
        pressed: breakpoints.md ? addHslAlpha(theme[8], 0.2) : theme[5],
      }}
      borderColors={{
        default: breakpoints.md ? "transparent" : theme[3],
        hovered: breakpoints.md ? "transparent" : theme[4],
        pressed: breakpoints.md ? "transparent" : theme[5],
      }}
      containerStyle={!breakpoints.md && { flex: 1 }}
    >
      <Text
        numberOfLines={1}
        weight={700}
        style={{ fontSize: 15, paddingTop: 5, color: theme[11] }}
      >
        {dayjs(start).format(titleFormat).split("•")?.[0]}
      </Text>
      <Text
        numberOfLines={1}
        style={{ opacity: 0.6, fontSize: 15, paddingTop: 5, color: theme[11] }}
      >
        {dayjs(start).format(titleFormat).split("• ")?.[1]}
      </Text>
    </Button>
  );

  const SafeView = breakpoints.md ? React.Fragment : View;
  return (
    <SafeView>
      <View
        style={[
          { flexDirection: "row", alignItems: "center" },
          breakpoints.md
            ? { marginRight: "auto" }
            : {
                backgroundColor: theme[3],
                paddingHorizontal: 5,
                paddingVertical: 5,
                flexDirection: "row-reverse",
              },
        ]}
      >
        <IconButton
          variant="text"
          onPress={handleToday}
          size={45}
          disabled={isTodaysView}
          style={[
            breakpoints.md && {
              borderRadius: 20,
              marginLeft: -45,
              marginRight: -10,
              zIndex: 9,
            },
            !breakpoints.md && isTodaysView && { display: "none" },
            { opacity: isTodaysView ? 0 : 1 },
          ]}
        >
          <View
            style={{
              borderWidth: 2,
              borderTopWidth: 4,
              borderColor: theme[11],
              width: 20,
              height: 20,
              borderRadius: 2,
              marginTop: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 10, color: theme[11] }} weight={700}>
              {dayjs().format("DD")}
            </Text>
          </View>
        </IconButton>
        <View
          style={[
            {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            },
            breakpoints.md
              ? {
                  marginRight: !isTodaysView ? undefined : "auto",
                  borderRadius: 20,
                }
              : { flex: 1 },
          ]}
        >
          <IconButton
            onPress={handlePrev}
            icon="arrow_back_ios_new"
            size={45}
          />
          {typeof handleMenuOpen === "undefined" ? (
            <MenuPopover
              trigger={trigger}
              scrollViewProps={{ bounces: false }}
              containerStyle={{ width: 300 }}
            >
              <AgendaCalendarMenu weekMode={weekMode} />
            </MenuPopover>
          ) : (
            trigger
          )}
          <IconButton onPress={handleNext} icon="arrow_forward_ios" size={45} />
        </View>
      </View>
    </SafeView>
  );
}

