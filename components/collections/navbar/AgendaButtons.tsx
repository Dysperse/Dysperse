import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType } from "dayjs";
import { router, useGlobalSearchParams } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { AgendaCalendarMenu } from "./AgendaCalendarMenu";

export function AgendaButtons() {
  const theme = useColorTheme();
  // eslint-disable-next-line prefer-const
  let { agendaView, start }: any = useGlobalSearchParams();
  if (!agendaView) agendaView = "week";

  const handlePrev = useCallback(async () => {
    const newParams = {
      start: dayjs(start)
        .subtract(1, agendaView as ManipulateType)
        .toISOString(),
    };
    router.setParams(newParams);
  }, [agendaView, start]);

  const handleNext = useCallback(() => {
    router.setParams({
      start: dayjs(start)
        .startOf(agendaView as ManipulateType)
        .add(1, agendaView as ManipulateType)
        .toISOString(),
    });
  }, [agendaView, start]);

  const handleToday = useCallback(() => {
    router.setParams({
      start: dayjs().startOf("day").utc().toISOString(),
    });
  }, []);

  const isTodaysView = dayjs().isBetween(
    dayjs(start).startOf(agendaView as ManipulateType),
    dayjs(start).endOf(agendaView as ManipulateType),
    "day",
    "[]"
  );
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={[
        !breakpoints.md && {
          backgroundColor: theme[3],
          paddingHorizontal: 15,
          paddingVertical: 5,
          borderTopColor: theme[5],
          borderTopWidth: 1,
        },
        breakpoints.md && {
          marginRight: "auto",
        },
        {
          flexDirection: "row-reverse",
          gap: 10,
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
        <AgendaCalendarMenu />
        <IconButton onPress={handleNext}>
          <Icon>east</Icon>
        </IconButton>
      </View>
    </View>
  );
}
