import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
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
  center,
}: {
  handleMenuOpen?: () => void;
  weekMode?: boolean;
  center?: boolean;
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

  const titleFormat = "MMMM YYYY";

  const trigger = (
    <Button
      onPress={handleMenuOpen}
      height={45}
      backgroundColors={{
        default: breakpoints.md
          ? addHslAlpha(theme[8], 0)
          : addHslAlpha(theme[8], 0),
        hovered: breakpoints.md ? addHslAlpha(theme[8], 0.15) : theme[4],
        pressed: breakpoints.md ? addHslAlpha(theme[8], 0.2) : theme[5],
      }}
      borderColors={{
        default: breakpoints.md ? "transparent" : theme[3],
        hovered: breakpoints.md ? "transparent" : theme[4],
        pressed: breakpoints.md ? "transparent" : theme[5],
      }}
      style={{
        justifyContent: "flex-start",
        paddingHorizontal: 15,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          fontSize: breakpoints.md ? 20 : 23,
          fontFamily: "serifText700",
          paddingTop: 2,
          textAlign: "left",
          color: theme[11],
        }}
      >
        {dayjs(start).format(titleFormat).split("•")?.[0]}
      </Text>

      {!breakpoints.md && (
        <Icon size={30} style={{ marginLeft: -5 }}>
          expand_more
        </Icon>
      )}
    </Button>
  );

  const SafeView = breakpoints.md ? React.Fragment : View;
  const todayButton = (
    <IconButton
      variant="text"
      onPress={handleToday}
      size={45}
      disabled={isTodaysView}
      style={[
        breakpoints.md && {
          borderRadius: 20,
          marginLeft: -100,
          marginRight: -10,
          zIndex: 9,
        },
        !breakpoints.md && isTodaysView && { display: "none" },
        { opacity: isTodaysView ? 0 : 1 },
      ]}
    >
      <View
        style={{
          borderWidth: 1,
          borderTopWidth: 3,
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
  );

  return (
    <SafeView>
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
          },
          breakpoints.md
            ? { marginRight: "auto" }
            : {
                paddingHorizontal: 5,
                paddingVertical: 5,
              },
        ]}
      >
        {breakpoints.md && todayButton}
        {weekMode && breakpoints.md && (
          <IconButton
            style={{ marginLeft: 10 }}
            onPress={handlePrev}
            icon="west"
            size={45}
          />
        )}
        <View
          style={[
            {
              flexDirection: "row",
              justifyContent: center ? undefined : "space-between",
              alignItems: "center",
              paddingHorizontal: center ? 5 : undefined,
            },
            breakpoints.md
              ? {
                  marginRight: !isTodaysView ? undefined : "auto",
                  borderRadius: 20,
                }
              : { flex: 1 },
          ]}
        >
          {typeof handleMenuOpen === "undefined" ? (
            <MenuPopover
              trigger={trigger}
              containerStyle={{ width: breakpoints.md ? 300 : "100%" }}
            >
              <AgendaCalendarMenu weekMode={weekMode} />
            </MenuPopover>
          ) : (
            trigger
          )}
          {weekMode && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 5,
              }}
            >
              {!breakpoints.md && todayButton}
              {!breakpoints.md && (
                <IconButton
                  style={{ marginLeft: 10 }}
                  onPress={handlePrev}
                  icon="west"
                  size={45}
                />
              )}
              <IconButton onPress={handleNext} icon="east" size={45} />
            </View>
          )}
        </View>
      </View>
    </SafeView>
  );
}

