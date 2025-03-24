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
import { Platform, Pressable, StyleProp, TextStyle, View } from "react-native";
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

export const TimeInput = forwardRef(
  (
    {
      value: defaultValue,
      setValue: setDefaultValue,
      valueKey = "date",
      style,
    }: {
      value: Dayjs;
      setValue: (key: string, value: Dayjs) => void;
      valueKey?: "date" | "end";
      style?: StyleProp<TextStyle>;
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
            setDefaultValue({
              [valueKey]: dayjs(defaultValue)
                .hour(parseInt(hours))
                .minute(parseInt(minutes)),
            });
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
        style={[
          {
            flex: 1,
            textAlign: "center",
            height: 35,
          },
          style,
        ]}
        placeholder="12:00"
        value={value}
        onChangeText={(e) => setValue(e)}
      />
    );
  }
);

function CalendarPreview({
  value,
  setValue,
  view,
  ignoreYear,
}: {
  value: any;
  setValue: any;
  view: string;
  ignoreYear?: boolean;
}) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const [calendarMonthId, setCalendarMonthId] = useState(
    toDateId(dayjs(value?.date || undefined).toDate())
  );

  useEffect(() => {
    setCalendarMonthId(toDateId(dayjs(value?.date || undefined).toDate()));
  }, [value]);

  const onCalendarDayPress = (date) =>
    setValue((t) => ({
      ...t,
      [view === "end" ? "end" : "date"]: dayjs(fromDateId(date).toISOString()),
    }));

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
            ) &&
            view === "start" &&
            value?.end
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
        getCalendarMonthFormat={(date) =>
          dayjs(date).format(ignoreYear ? "MMMM" : "MMMM YYYY")
        }
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

  return !value?.date ? null : (
    <Button
      onPress={() => {
        setValue((t) => ({ ...t, dateOnly: !t.dateOnly }));
      }}
      containerStyle={{ flex: 1, marginTop: "auto" }}
      style={{ padding: 0 }}
      variant="outlined"
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
  );
}

const OpenListener = ({ onOpen, onClose }) => {
  useEffect(() => {
    if (typeof onOpen === "function") onOpen();
    return () => {
      if (typeof onClose === "function") onClose();
    };
  }, [onOpen, onClose]);
  return null;
};

export const DatePicker = forwardRef(
  (
    {
      value,
      setValue,
      ignoreYear,
      ignoreTime,
      onOpen,
      onClose,
    }: {
      value: any;
      setValue: any;
      ignoreYear?: any;
      ignoreTime?: any;
      onOpen?: any;
      onClose?: any;
    },
    ref: any
  ) => {
    const [view, setView] = useState("start");
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      if (localValue === "end" && !localValue?.date) {
        setView("start");
      }
    }, [view, setValue, localValue]);

    const secondary = localValue?.end
      ? `to ${dayjs(localValue?.end).format(
          localValue.dateOnly ? "MMMM Do" : "MMM Do [@] h:mm A"
        )}`
      : !localValue?.dateOnly && localValue?.date
      ? `at ${dayjs(localValue?.date).format("h:mm A")}`
      : "";

    return (
      <Modal sheetRef={ref} animation="SCALE" maxWidth={400}>
        <OpenListener onOpen={onOpen} onClose={onClose} />
        <View style={{ padding: 20, paddingTop: 15 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Button
              dense
              style={{
                opacity:
                  !localValue?.date && !localValue?.end && localValue?.dateOnly
                    ? 0
                    : 1,
              }}
              onPress={() => {
                setValue({
                  date: null,
                  end: null,
                  dateOnly: true,
                });
                ref.current.forceClose();
              }}
            >
              <ButtonText>Clear</ButtonText>
            </Button>
            <View style={{ flex: 1, height: 50, justifyContent: "center" }}>
              <Text
                weight={800}
                style={{
                  fontSize: 20,
                  textAlign: "center",
                  fontFamily: "serifText700",
                }}
              >
                {localValue?.date
                  ? dayjs(localValue?.date).format(
                      localValue.dateOnly || !localValue.end
                        ? "MMMM Do"
                        : "MMM Do [@] h:mm A"
                    )
                  : "Select a date"}
              </Text>
              {!ignoreTime && secondary && (
                <Text style={{ opacity: 0.5, textAlign: "center" }}>
                  {secondary}
                </Text>
              )}
            </View>
            <IconButton
              icon="check"
              style={{ marginLeft: 20 }}
              size={40}
              variant="filled"
              onPress={() => {
                ref.current.close();
                setValue(localValue);
              }}
            />
          </View>
          <View
            style={{
              paddingTop: 10,
              gap: 10,
              minHeight:
                Platform.OS === "web" ? undefined : localValue.date ? 450 : 310,
            }}
          >
            {localValue.date && !ignoreTime && (
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
                  disabled={!localValue?.date}
                  bold={view === "end"}
                  icon={localValue?.end ? undefined : "add"}
                  text={localValue?.end ? "End" : "Add end"}
                  iconPosition="end"
                  variant={view === "end" ? "filled" : "outlined"}
                  containerStyle={{ flex: 1 }}
                  onPress={() => {
                    setView("end");
                    if (!localValue?.end || !dayjs(localValue?.end).isValid())
                      setLocalValue((t) => ({
                        ...t,
                        end: dayjs(localValue?.date).add(1, "hour"),
                      }));
                  }}
                />
              </View>
            )}
            <CalendarPreview
              ignoreYear={ignoreYear}
              value={localValue}
              setValue={setLocalValue}
              view={view}
            />
            {!ignoreTime && (
              <AllDaySwitch
                value={localValue}
                setValue={setLocalValue}
                view={view}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  }
);
