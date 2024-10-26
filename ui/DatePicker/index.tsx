import { dysperseCalendarTheme } from "@/components/collections/navbar/AgendaCalendarMenu";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import {
  Calendar,
  fromDateId,
  toDateId,
} from "@marceloterreiro/flash-calendar";
import convertTime from "convert-time";
import dayjs, { Dayjs } from "dayjs";
import { forwardRef, RefObject, useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Collapsible from "react-native-collapsible";
import { TextInput } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Button, ButtonText } from "../Button";
import { addHslAlpha } from "../color";
import { useColorTheme } from "../color/theme-provider";
import Icon from "../Icon";
import IconButton from "../IconButton";
import Modal from "../Modal";
import Text from "../Text";
import TextField from "../TextArea";

const TimeInput = forwardRef(
  (
    {
      value: defaultValue,
      setValue: setDefaultValue,
      valueKey = "date",
    }: {
      value: Dayjs;
      setValue: (key: string, value: Dayjs) => void;
      valueKey?: "date" | "end";
    },
    ref: RefObject<TextInput>
  ) => {
    const [value, setValue] = useState(defaultValue?.format?.("h:mm A") || "");

    return (
      <TextField
        selectTextOnFocus
        onBlur={(e) => {
          const n = e.nativeEvent.text.toLowerCase();
          if (convertTime(n)) {
            const [hours, minutes] = convertTime(n).split(":");
            setDefaultValue(
              valueKey,
              dayjs(defaultValue)
                .hour(parseInt(hours))
                .minute(parseInt(minutes))
            );
            setValue(
              dayjs(defaultValue)
                .hour(parseInt(hours))
                .minute(parseInt(minutes))
                .format("h:mm A")
            );
          } else {
            setValue(defaultValue.format("h:mm A"));
            Toast.show({
              type: "error",
              text1: "Please type a valid time",
            });
          }
        }}
        inputRef={ref}
        variant="filled+outlined"
        style={{
          flex: 1,
          textAlign: "center",
          height: 35,
        }}
        placeholder="12:00"
        value={value}
        onChangeText={(e) => setValue(e)}
      />
    );
  }
);

function CalendarPreview({ value, setValue, view }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const [calendarMonthId, setCalendarMonthId] = useState(
    toDateId(dayjs().toDate())
  );

  useEffect(() => {
    setCalendarMonthId(toDateId(dayjs().toDate()));
  }, []);

  const onCalendarDayPress = (date) =>
    setValue(
      view === "end" ? "end" : "date",
      dayjs(fromDateId(date).toISOString())
    );

  return (
    <View
      style={{
        flex: breakpoints.md ? 1 : undefined,
        borderColor: theme[4],
        borderWidth: 1,
        borderRadius: 25,
        padding: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          marginBottom: -20,
          zIndex: 99,
          justifyContent: "space-between",
        }}
      >
        <IconButton
          disabled={
            calendarMonthId === toDateId(dayjs().toDate()) && view === "end"
          }
          icon="arrow_back"
          onPress={() =>
            setCalendarMonthId(
              toDateId(
                dayjs(fromDateId(calendarMonthId).toISOString())
                  .subtract(1, "month")
                  .toDate()
              )
            )
          }
        />
        <IconButton
          disabled={
            dayjs(fromDateId(calendarMonthId).toDateString()).isSame(
              dayjs(value?.end),
              "month"
            ) && view === "start"
          }
          icon="arrow_forward"
          onPress={() =>
            setCalendarMonthId(
              toDateId(
                dayjs(fromDateId(calendarMonthId).toISOString())
                  .add(1, "month")
                  .toDate()
              )
            )
          }
        />
      </View>
      <Calendar
        calendarMonthId={calendarMonthId}
        theme={{
          ...dysperseCalendarTheme(theme),
          rowMonth: {
            content: {
              textAlign: "center",
              textTransform: "uppercase",
              marginTop: -15,
              color: addHslAlpha(theme[11], 0.5),
              fontFamily: "body_900",
            },
          },
        }}
        onCalendarDayPress={onCalendarDayPress}
        calendarMinDateId={
          view === "end" ? toDateId(dayjs(value?.date).toDate()) : undefined
        }
        calendarMaxDateId={
          view === "start" && value?.end
            ? toDateId(dayjs(value?.end).toDate())
            : undefined
        }
        calendarActiveDateRanges={
          value?.date
            ? [
                {
                  startId: toDateId(dayjs(value?.date).toDate()),
                  endId: value?.end
                    ? toDateId(dayjs(value?.end).toDate())
                    : toDateId(dayjs(value?.date).toDate()),
                },
              ]
            : []
        }
      />
    </View>
  );
}

function AllDaySwitch({ view, value, setValue }) {
  const ref = useRef(null);

  return (
    <Collapsible collapsed={!value?.date}>
      <Button
        onPress={() => {
          setValue("dateOnly", !value.dateOnly);
          if (value.dateOnly) {
            setTimeout(() => {
              ref.current.focus();
            }, 1);
          }
        }}
        containerStyle={{ flex: 1, borderRadius: 0 }}
        style={{ padding: 0 }}
      >
        {value.dateOnly ? (
          <ButtonText>All day</ButtonText>
        ) : (
          <Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
            <TimeInput
              ref={ref}
              value={view === "start" ? value?.date : value?.end}
              setValue={setValue}
              valueKey={view === "start" ? "date" : "end"}
            />
          </Pressable>
        )}
        <Icon>toggle_{value.dateOnly ? "on" : "off"}</Icon>
      </Button>
    </Collapsible>
  );
}

export const DatePicker = forwardRef(
  ({ value, setValue }: { value: any; setValue: any }, ref: any) => {
    const [view, setView] = useState("start");

    useEffect(() => {
      if (view === "end" && !value?.date) {
        setView("start");
      }
      if (view === "end" && !value?.end) {
        setValue("end", dayjs(value?.date).add(1, "hour"));
      }
    }, [view, setValue, value]);

    return (
      <Modal sheetRef={ref} animation="SCALE" maxWidth={400}>
        <View style={{ padding: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Button
              dense
              style={{
                opacity: !value?.date && !value?.end && value?.dateOnly ? 0 : 1,
              }}
              onPress={() => {
                setValue("date", null);
                setValue("end", null);
                setValue("dateOnly", true);
              }}
            >
              <ButtonText>Clear</ButtonText>
            </Button>
            <View style={{ flex: 1 }}>
              <Text weight={800} style={{ fontSize: 20, textAlign: "center" }}>
                {value?.date
                  ? dayjs(value?.date).format(
                      value.dateOnly || !value.end
                        ? "MMMM Do"
                        : "MMM Do [@] h:mm A"
                    )
                  : "Select a date"}
              </Text>
              <Text style={{ opacity: 0.5, textAlign: "center" }}>
                {value?.end
                  ? `to ${dayjs(value?.end).format(
                      value.dateOnly ? "MMMM Do" : "MMM Do [@] h:mm A"
                    )}`
                  : !value?.dateOnly && value?.date
                  ? `at ${dayjs(value?.date).format("h:mm A")}`
                  : ""}
              </Text>
            </View>
            <IconButton
              icon="check"
              style={{ marginLeft: 20 }}
              size={40}
              variant="filled"
              onPress={() => ref.current.close()}
            />
          </View>
          <View style={{ paddingTop: 10, gap: 10 }}>
            <Collapsible collapsed={Boolean(!value?.date)}>
              <View style={{ flexDirection: "row", gap: 10, paddingTop: 5 }}>
                <Button
                  bold={view === "start"}
                  text="Start"
                  iconPosition="end"
                  variant={view === "start" ? "filled" : "outlined"}
                  containerStyle={{ flex: 1 }}
                  onPress={() => setView("start")}
                />
                <Button
                  disabled={!value?.date}
                  bold={view === "end"}
                  icon={value?.end ? undefined : "add"}
                  text={value?.end ? "End" : "Add end time"}
                  iconPosition="end"
                  variant={view === "end" ? "filled" : "outlined"}
                  containerStyle={{ flex: 1 }}
                  onPress={() => setView("end")}
                />
              </View>
            </Collapsible>
            <CalendarPreview value={value} setValue={setValue} view={view} />
            <AllDaySwitch value={value} setValue={setValue} view={view} />
          </View>
        </View>
      </Modal>
    );
  }
);

