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
        .format("YYYY-MM-DD"),
    };
    router.setParams(newParams);
  }, [agendaView, start]);

  const handleNext = useCallback(() => {
    router.setParams({
      start: dayjs(start)
        .startOf(agendaView as ManipulateType)
        .add(1, agendaView as ManipulateType)
        .format("YYYY-MM-DD"),
    });
  }, [agendaView, start]);

  const handleToday = useCallback(() => {
    router.setParams({
      start: dayjs().format("YYYY-MM-DD"),
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
          borderTopColor: theme[5],
          borderTopWidth: 1,
        },
        {
          flexDirection: "row",
          marginLeft: "auto",
          gap: 10,
        },
      ]}
    >
      <View
        style={[
          {
            flexDirection: "row",
            justifyContent: "space-between",
            height: 50,
            alignItems: "center",
            paddingHorizontal: 10,
          },
          breakpoints.md
            ? {
                marginRight: !isTodaysView ? undefined : "auto",
                height: 50,
                borderRadius: 20,
                backgroundColor: theme[3],
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

      {!isTodaysView && (
        <View
          style={[
            {
              marginRight: "auto",
              flexDirection: "row",
              height: 50,
              borderRadius: 20,
              alignItems: "center",
              paddingHorizontal: 10,
            },
            breakpoints.md && {
              borderWidth: 1,
              borderColor: theme[6],
            },
          ]}
        >
          <IconButton onPress={handleToday}>
            <Icon>today</Icon>
          </IconButton>
        </View>
      )}
    </View>
  );
}
