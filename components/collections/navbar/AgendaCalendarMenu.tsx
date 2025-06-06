import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import {
  Calendar,
  CalendarListProps,
  CalendarListRef,
  CalendarProps,
  CalendarTheme,
  fromDateId,
  toDateId,
} from "@marceloterreiro/flash-calendar";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router, useGlobalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";

export const dysperseCalendarTheme = (theme) =>
  ({
    rowMonth: {
      content: {
        textAlign: "left",
        textTransform: "uppercase",
        color: addHslAlpha(theme[11], 0.5),
        fontFamily: "body_900",
      },
    },
    rowWeek: {
      container: {
        borderBottomWidth: 2,
        borderBottomColor: addHslAlpha(theme[11], 0.2),
        borderStyle: "solid",
      },
    },
    itemWeekName: {
      content: { color: addHslAlpha(theme[11], 0.6), fontFamily: "body_300" },
    },
    itemDayContainer: {
      activeDayFiller: {
        backgroundColor: theme[11],
      },
    },
    itemDay: {
      disabled: () => ({
        content: {
          fontFamily: "body_300",
          color: addHslAlpha(theme[11], 0.2),
        },
      }),
      idle: ({ isPressed, isWeekend }) => ({
        container: {
          backgroundColor: isPressed ? theme[11] : "transparent",
        },
        content: {
          fontFamily: "body_300",
          color: addHslAlpha(theme[isPressed ? 2 : 11], isWeekend ? 0.5 : 1),
        },
      }),
      today: ({ isPressed }) => ({
        container: {
          borderColor: addHslAlpha(theme[11], 0.2),
          borderWidth: 2,
          backgroundColor: isPressed ? theme[11] : "transparent",
        },
        content: {
          fontFamily: "body_700",
          color: theme[isPressed ? 2 : 11],
        },
      }),
      active: () => ({
        container: {
          backgroundColor: theme[11],
        },
        content: {
          fontFamily: "body_700",
          color: theme[2],
        },
      }),
    },
  } as CalendarTheme);

export function AgendaCalendarMenu({
  handleMenuClose,
  weekMode,
}: {
  handleMenuClose?: () => void;
  weekMode?: boolean;
}) {
  const calendarRef = useRef<CalendarListRef>(null);
  const theme = useColorTheme();
  const { start }: any = useGlobalSearchParams();

  const today = toDateId(dayjs(start).toDate());
  const [calendarMonthId, setCalendarMonthId] = useState(today);

  useEffect(() => {
    setCalendarMonthId(today);
  }, [today]);

  const SafeCalendar =
    typeof handleMenuClose === "undefined" ? Calendar : Calendar.List;

  return (
    <>
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? undefined : 0,
          padding: typeof handleMenuClose === "undefined" ? 10 : 20,
          gap: 20,
          flexDirection:
            typeof handleMenuClose === "undefined"
              ? "column-reverse"
              : "column",
          height: typeof handleMenuClose === "undefined" ? undefined : 450,
        }}
      >
        {typeof handleMenuClose !== "undefined" && (
          <LinearGradient
            colors={[theme[1], addHslAlpha(theme[1], 0)]}
            style={{
              height: 50,
              width: "100%",
              zIndex: 9,
              marginTop: -25,
              marginBottom: -70,
            }}
          />
        )}
        <SafeCalendar
          contentOffset={{ y: -25 }}
          calendarActiveDateRanges={[
            typeof handleMenuClose === "undefined" && weekMode
              ? {
                  startId: toDateId(dayjs(start).startOf("week").toDate()),
                  endId: toDateId(dayjs(start).endOf("week").toDate()),
                }
              : {
                  startId: toDateId(dayjs(start).toDate()),
                  endId: toDateId(dayjs(start).toDate()),
                },
          ]}
          theme={dysperseCalendarTheme(theme)}
          {...((typeof handleMenuClose === "undefined"
            ? ({
                calendarMonthId,
              } as Partial<CalendarProps>)
            : ({
                calendarInitialMonthId: calendarMonthId,
                endFillColor: theme[8],
                ref: calendarRef,
              } as Partial<CalendarListProps>)) as any)}
          onCalendarDayPress={(day) => {
            handleMenuClose?.();
            router.setParams({
              start: dayjs(fromDateId(day).toISOString(), "YYYY-MM-DD")
                .utc()
                .toISOString(),
            });
          }}
        />
        {typeof handleMenuClose !== "undefined" && (
          <LinearGradient
            colors={[addHslAlpha(theme[1], 0), theme[1]]}
            style={{
              height: 50,
              width: "100%",
              marginTop: -70,
              marginBottom: -25,
            }}
          />
        )}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
          }}
        >
          {typeof handleMenuClose !== "undefined" && (
            <Button
              backgroundColors={{
                default: theme[2],
                hovered: theme[3],
                pressed: theme[4],
              }}
              borderColors={{
                default: theme[4],
                hovered: theme[5],
                pressed: theme[6],
              }}
              variant="outlined"
              height={60}
              bold
              containerStyle={{ flex: 1 }}
              onPress={() => {
                calendarRef.current?.scrollToMonth(new Date(), true);
                handleMenuClose();
              }}
              icon="close"
              text="Cancel"
            />
          )}
          {typeof handleMenuClose === "undefined" && (
            <IconButton
              variant="outlined"
              size={typeof handleMenuClose === "undefined" ? 40 : 60}
              icon="arrow_back_ios_new"
              onPress={() =>
                setCalendarMonthId(
                  toDateId(
                    dayjs(fromDateId(calendarMonthId))
                      .subtract(1, "month")
                      .toDate()
                  )
                )
              }
            />
          )}
          <Button
            backgroundColors={{
              default: addHslAlpha(theme[8], 0.1),
              hovered: addHslAlpha(theme[8], 0.2),
              pressed: addHslAlpha(theme[8], 0.3),
            }}
            borderColors={{
              default: addHslAlpha(theme[8], 0),
              hovered: addHslAlpha(theme[8], 0),
              pressed: addHslAlpha(theme[8], 0),
            }}
            variant="filled"
            height={typeof handleMenuClose === "undefined" ? 40 : 60}
            bold
            containerStyle={{ flex: 1 }}
            onPress={() => {
              if (typeof handleMenuClose !== "undefined") {
                calendarRef.current?.scrollToMonth(new Date(), true);
                setCalendarMonthId(toDateId(dayjs().startOf("month").toDate()));
                // router.setParams({ start: dayjs().toISOString() });
                // handleMenuClose();
              } else {
                router.setParams({ start: dayjs().toISOString() });
                setCalendarMonthId(toDateId(dayjs().startOf("month").toDate()));
              }
            }}
            icon="undo"
            text="Today"
          />
          {typeof handleMenuClose === "undefined" && (
            <IconButton
              variant="outlined"
              size={typeof handleMenuClose === "undefined" ? 40 : 60}
              icon="arrow_forward_ios"
              onPress={() =>
                setCalendarMonthId(
                  toDateId(
                    dayjs(fromDateId(calendarMonthId)).add(1, "month").toDate()
                  )
                )
              }
            />
          )}
        </View>
      </View>
    </>
  );
}

