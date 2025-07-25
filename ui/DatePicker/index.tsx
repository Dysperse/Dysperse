import { dysperseCalendarTheme } from "@/components/collections/navbar/AgendaCalendarMenu";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import {
  Calendar,
  fromDateId,
  toDateId,
} from "@marceloterreiro/flash-calendar";
import convertTime from "convert-time";
import dayjs, { Dayjs } from "dayjs";
import { RefObject, useEffect, useState } from "react";
import { Platform, StyleProp, TextStyle, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Button, ButtonText } from "../Button";
import { addHslAlpha } from "../color";
import { useColorTheme } from "../color/theme-provider";
import IconButton from "../IconButton";
import Modal from "../Modal";
import Text from "../Text";
import TextField from "../TextArea";

export const TimeInput = ({
  value: defaultValue,
  setValue: setDefaultValue,
  valueKey = "date",
  style,
  ref,
}: {
  value: Dayjs;
  setValue: (key: string, value: Dayjs) => void;
  valueKey?: "date" | "end";
  style?: StyleProp<TextStyle>;
  ref: RefObject<TextInput>;
}) => {
  const { session } = useUser();
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
              .format(session.user.militaryTime ? "H:mm" : "h:mm A")
          );
        } else {
          setValue(
            defaultValue.format(session.user.militaryTime ? "H:mm" : "h:mm A")
          );
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
          height: 50,
        },
        style,
      ]}
      placeholder="12:00"
      value={value}
      onChangeText={(e) => setValue(e)}
    />
  );
};

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
    setValue((t) => {
      const key = view === "end" ? "end" : "date";
      const time = dayjs(t[key] || undefined);
      return {
        ...t,
        [key]: dayjs(fromDateId(date))
          .set("hour", time.hour())
          .set("minute", time.minute())
          .set("second", time.second())
          .set("millisecond", time.millisecond()),
      };
    });

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

const OpenListener = ({ onOpen, onClose }) => {
  useEffect(() => {
    if (typeof onOpen === "function") onOpen();
    return () => {
      if (typeof onClose === "function") onClose();
    };
  }, [onOpen, onClose]);
  return null;
};

export const DatePicker = ({
  value,
  setValue,
  ignoreYear,
  ignoreTime,
  onOpen,
  onClose,
  ref,
}: {
  value: any;
  setValue: any;
  ignoreYear?: any;
  ignoreTime?: any;
  onOpen?: any;
  onClose?: any;
  ref?: RefObject<any>;
}) => {
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
    <Modal
      sheetRef={ref}
      animation="SCALE"
      maxWidth={400}
      onClose={() => {
        setValue(localValue);
        if (typeof onClose === "function") onClose();
      }}
    >
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
          <CalendarPreview
            ignoreYear={ignoreYear}
            value={localValue}
            setValue={setLocalValue}
            view={view}
          />
        </View>
      </View>
    </Modal>
  );
};

