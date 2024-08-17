import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { router, useGlobalSearchParams } from "expo-router";

import { addHslAlpha } from "@/ui/color";
import IconButton from "@/ui/IconButton";
import {
  Calendar,
  CalendarListRef,
  CalendarTheme,
  fromDateId,
  toDateId,
} from "@marceloterreiro/flash-calendar";
import { useEffect, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";

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
          borderColor: "rgba(255, 255, 255, 0.5)",
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
}: {
  handleMenuClose?: () => void;
}) {
  const calendarRef = useRef<CalendarListRef>(null);
  const theme = useColorTheme();
  const { start }: any = useGlobalSearchParams();
  const { height } = useWindowDimensions();

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
          paddingTop: 0,
          padding: 20,
          height:
            typeof handleMenuClose === "undefined" ? undefined : height - 100,
        }}
      >
        <SafeCalendar
          calendarActiveDateRanges={[
            {
              startId: toDateId(dayjs(start).startOf("week").toDate()),
              endId: toDateId(dayjs(start).endOf("week").toDate()),
            },
          ]}
          theme={dysperseCalendarTheme(theme)}
          {...(typeof handleMenuClose === "undefined" && {
            calendarInitialMonthId: today,
            endFillColor: theme[8],
            ref: calendarRef,
          })}
          calendarMonthId={calendarMonthId}
          onCalendarDayPress={(day) => {
            handleMenuClose?.();
            router.setParams({
              start: dayjs(fromDateId(day).toISOString(), "YYYY-MM-DD")
                .utc()
                .toISOString(),
            });
          }}
        />
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingTop: 10,
            marginBottom: -10,
          }}
        >
          {typeof handleMenuClose !== "undefined" && (
            <Button
              backgroundColors={{
                default: theme[3],
                hovered: theme[4],
                pressed: theme[5],
              }}
              borderColors={{
                default: theme[5],
                hovered: theme[6],
                pressed: theme[7],
              }}
              variant="outlined"
              height={60}
              bold
              containerStyle={{ flex: 1 }}
              onPress={handleMenuClose}
              icon="close"
              text="Cancel"
            />
          )}
          <IconButton
            variant="outlined"
            size={60}
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
          <Button
            backgroundColors={{
              default: theme[4],
              hovered: theme[5],
              pressed: theme[6],
            }}
            borderColors={{
              default: theme[4],
              hovered: theme[5],
              pressed: theme[6],
            }}
            variant="filled"
            height={60}
            bold
            containerStyle={{ flex: 1 }}
            onPress={() => {
              if (typeof handleMenuClose !== "undefined") {
                const pastMonth = dayjs().startOf("month").toDate();
                calendarRef.current?.scrollToMonth(pastMonth, true);
              } else {
                router.setParams({ start: dayjs().toISOString() });
                setCalendarMonthId(toDateId(dayjs().startOf("month").toDate()));
              }
            }}
            icon="undo"
            text="Today"
          />
          <IconButton
            variant="outlined"
            size={60}
            icon="arrow_forward_ios"
            onPress={() =>
              setCalendarMonthId(
                toDateId(
                  dayjs(fromDateId(calendarMonthId)).add(1, "month").toDate()
                )
              )
            }
          />
        </View>
      </View>
    </>
  );
}
