import { dysperseCalendarTheme } from "@/components/collections/navbar/AgendaCalendarMenu";
import { normalizeRecurrenceRuleObject } from "@/components/task/drawer/details";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import dayjs from "dayjs";
import { forwardRef, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { RRule } from "rrule";
import { Button, ButtonText } from "../Button";
import { useColorTheme } from "../color/theme-provider";
import { TimeInput } from "../DatePicker";
import Icon from "../Icon";
import IconButton from "../IconButton";
import { ListItemButton } from "../ListItemButton";
import ListItemText from "../ListItemText";
import MenuPopover from "../MenuPopover";
import Modal from "../Modal";
import Text from "../Text";
import TextField from "../TextArea";

const Every = ({
  value,
  setValue,
  handleEdit,
}: {
  value;
  setValue;
  handleEdit;
}) => {
  const frequency = value.freq;
  const interval = value.interval;
  const theme = useColorTheme();

  return (
    <View>
      <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 20 }}>
        Repeat every
      </Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TextField
          placeholder="1"
          style={{
            flex: 1,
            paddingHorizontal: 20,
            borderRadius: 99,
            fontSize: 20,
            width: "100%",
          }}
          weight={800}
          variant="filled"
          defaultValue={value?.interval || 1}
          onChange={(e) => {
            const t = e.nativeEvent.text;
            if (parseInt(t) && parseInt(t) > 0)
              handleEdit("interval", parseInt(e.nativeEvent.text));
          }}
        />
        <View style={{ height: 50, flexShrink: 0 }}>
          <MenuPopover
            options={[
              { text: "Week", value: RRule.WEEKLY },
              { text: "Month", value: RRule.MONTHLY },
              { text: "Year", value: RRule.YEARLY },
            ].map((e) => ({
              ...e,
              selected: e.value === frequency,
              callback: () => handleEdit("freq", e.value),
            }))}
            trigger={
              <Button
                variant="filled"
                large
                height={50}
                text={["Days", "Weeks", "Months", "Years"][
                  3 - value?.freq
                ].replace("s", interval === 1 ? "" : "s")}
                iconPosition="end"
                icon="expand_more"
                bold
              />
            }
          />
        </View>
      </View>
    </View>
  );
};

function On({ value, setValue, handleEdit }) {
  const theme = useColorTheme();
  const isMonthly = value.freq === 1;

  const l = isMonthly
    ? [
        { value: 1, text: "Jan" },
        { value: 2, text: "Feb" },
        { value: 3, text: "Mar" },
        { value: 4, text: "Apr" },
        { value: 5, text: "May" },
        { value: 6, text: "Jun" },
        { value: 7, text: "Jul" },
        { value: 8, text: "Aug" },
        { value: 9, text: "Sep" },
        { value: 10, text: "Oct" },
        { value: 11, text: "Nov" },
        { value: 12, text: "Dec" },
      ]
    : [
        { value: 0, text: "S" },
        { value: 1, text: "M" },
        { value: 2, text: "T" },
        { value: 3, text: "W" },
        { value: 4, text: "T" },
        { value: 5, text: "F" },
        { value: 6, text: "S" },
      ];

  return (
    <>
      <Text variant="eyebrow" style={{ marginTop: 20, marginBottom: -5 }}>
        ON
      </Text>
      <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
        {l.map((e, index) => {
          const t = value?.byweekday?.includes(e.value);

          return (
            <IconButton
              key={e.value + index}
              style={
                isMonthly
                  ? {
                      width: 340 / 4,
                      height: 40,
                    }
                  : {
                      flex: 1,
                      aspectRatio: 1,
                      height: "auto",
                    }
              }
              variant="filled"
              backgroundColors={{
                default: theme[t ? 9 : 3],
                pressed: theme[t ? 10 : 4],
                hovered: theme[t ? 11 : 5],
              }}
              onPress={() => {
                handleEdit(
                  isMonthly ? "bymonth" : "byweekday",
                  (value[isMonthly ? "bymonth" : "byweekday"]
                    ? value[isMonthly ? "bymonth" : "byweekday"].includes(
                        e.value
                      )
                      ? value[isMonthly ? "bymonth" : "byweekday"].filter(
                          (day) => day !== e.value
                        )
                      : [...value[isMonthly ? "bymonth" : "byweekday"], e.value]
                    : [
                        ...new Set(
                          [
                            ...(value?.[isMonthly ? "bymonth" : "byweekday"] ||
                              []),
                            e.value,
                          ].sort()
                        ),
                      ]
                  ).sort()
                );
              }}
            >
              <Text weight={900} style={{ color: theme[t ? 1 : 11] }}>
                {e.text}
              </Text>
            </IconButton>
          );
        })}
      </View>
    </>
  );
}

const SetValue = ({ value, setValue }: { value: any; setValue: any }) => {
  useEffect(() => {
    if (!value) {
      setValue(
        new RRule({
          freq: 2,
          byhour: [9],
          byminute: [0],
        }).options
      );
    }
  }, [setValue, value]);

  return null;
};

function Ends({ value, setValue, handleEdit }) {
  const endsInputDateRef = useRef(null);
  const endsInputCountRef = useRef(null);

  return (
    <>
      <Text variant="eyebrow" style={{ marginTop: 20, marginBottom: 5 }}>
        Ends
      </Text>
      <View>
        <ListItemButton
          style={{ height: 50, borderRadius: 99 }}
          variant={!value?.until && !value?.count ? "filled" : null}
          onPress={() => {
            setValue({
              ...value,
              until: null,
              count: null,
            });
            endsInputDateRef.current?.clear();
            endsInputCountRef.current?.clear();
          }}
        >
          <Icon>
            {!value?.until && !value?.count
              ? "radio_button_checked"
              : "radio_button_unchecked"}
          </Icon>
          <ListItemText truncate primary="Never" />
        </ListItemButton>
        <ListItemButton
          style={{ height: 50, borderRadius: 99 }}
          variant={value?.until && !value?.count ? "filled" : null}
          onPress={() => {
            setTimeout(() => {
              endsInputDateRef.current?.focus();
            }, 0);
          }}
        >
          <Icon>
            {value?.until && !value?.count
              ? "radio_button_checked"
              : "radio_button_unchecked"}
          </Icon>
          <ListItemText truncate primary="On" />
          <TextField
            inputRef={endsInputDateRef}
            variant="outlined"
            placeholder="Date"
            style={{
              padding: 5,
              paddingHorizontal: 20,
              width: 150,
              borderRadius: 99,
            }}
            defaultValue={
              value?.until ? dayjs(value?.until).format("MM/DD/YYYY") : ""
            }
            onBlur={(e) => {
              let n = dayjs(e.nativeEvent.text);
              if (
                n.year() === 2001 &&
                !e.nativeEvent.text.split(" ").includes("2001")
              ) {
                n = n.year(dayjs().year());
              }
              if (n.isValid()) {
                endsInputCountRef.current?.clear();
                setValue({
                  ...value,
                  until: n.toDate(),
                  count: null,
                });
              } else if (e.nativeEvent.text) {
                endsInputDateRef.current?.clear();
                Toast.show({
                  type: "error",
                  text1: "Please type a valid date",
                });
              }
            }}
          />
        </ListItemButton>
        <ListItemButton
          style={{ height: 50, borderRadius: 99 }}
          variant={value?.count && !value?.until ? "filled" : null}
          onPress={() => {
            setTimeout(() => {
              endsInputCountRef.current?.focus();
            }, 0);
          }}
        >
          <Icon>
            {value?.count && !value?.until
              ? "radio_button_checked"
              : "radio_button_unchecked"}
          </Icon>
          <ListItemText truncate primary="After" />
          <TextField
            inputRef={endsInputCountRef}
            variant="outlined"
            placeholder="#"
            style={{
              padding: 5,
              paddingHorizontal: 20,
              borderRadius: 99,
              width: 100,
            }}
            onBlur={(e) => {
              const n = parseInt(e.nativeEvent.text);
              if (n === 0) endsInputCountRef.current?.clear();
              if (n && !isNaN(n)) {
                endsInputDateRef.current?.clear();
                setValue({
                  ...value,
                  until: null,
                  count: n === 0 ? null : n,
                });
              } else if (e.nativeEvent.text) {
                endsInputCountRef.current?.clear();
                Toast.show({
                  type: "error",
                  text1: "Please type a number",
                });
              }
            }}
          />
          <Text weight={600}>times</Text>
        </ListItemButton>
      </View>
    </>
  );
}

function Preview({ value }) {
  const theme = useColorTheme();
  const [previewRange, setPreviewRange] = useState<Date>(new Date());

  return !value ? null : (
    <View style={{ marginTop: 30 }}>
      <Text variant="eyebrow">Preview</Text>
      <View
        style={{
          marginTop: 10,
          borderWidth: 1,
          borderColor: theme[4],
          borderRadius: 25,
          padding: 15,
        }}
      >
        <Calendar
          onCalendarDayPress={() => {}}
          calendarMonthId={toDateId(previewRange)}
          theme={dysperseCalendarTheme(theme)}
          calendarActiveDateRanges={normalizeRecurrenceRuleObject(value)
            .between(
              dayjs(previewRange)
                .startOf("month")
                .subtract(1, "month")
                .utc()
                .toDate(),
              dayjs(previewRange).utc().endOf("month").add(1, "month").toDate()
            )
            .map((date) => ({
              startId: toDateId(date),
              endId: toDateId(date),
            }))}
        />
      </View>
    </View>
  );
}

function AtTime({ value, setValue, handleEdit }) {
  const atTimeRef = useRef(null);
  const atTime = value?.byhour ? value?.byhour[0] : 9;

  return (
    <View>
      <Text variant="eyebrow" style={{ marginTop: 20, marginBottom: 5 }}>
        Time
      </Text>
      <TimeInput
        ref={atTimeRef}
        value={dayjs()
          .hour(atTime)
          .minute(value?.byminute ? value?.byminute[0] : 0)}
        setValue={(key, timeValue: any) => {
          setValue({
            ...value,
            byhour: [dayjs(timeValue).hour()],
            byminute: [dayjs(timeValue).minute()],
            bysecond: [0],
          });
        }}
      />
    </View>
  );
}

export const RecurrencePicker = forwardRef(
  ({ value, setValue }: { value: any; setValue: any }, ref: any) => {
    const handleEdit = (key, newValue) => {
      setValue({
        ...value,
        [key]: newValue,
      });
    };
    return (
      <Modal sheetRef={ref} animation="SCALE" maxWidth={400}>
        <BottomSheetScrollView>
          <SetValue value={value} setValue={setValue} />
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
                  opacity: value ? 1 : 0,
                }}
                onPress={() => {
                  setValue(null);
                }}
              >
                <ButtonText>Clear</ButtonText>
              </Button>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  weight={800}
                  style={{ fontSize: 20, textAlign: "center" }}
                >
                  Repeat
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
            {value && (
              <View style={{ paddingTop: 10, gap: 10 }}>
                <Every
                  value={value}
                  setValue={setValue}
                  handleEdit={handleEdit}
                />
                {value.freq !== 0 && (
                  <On
                    value={value}
                    setValue={setValue}
                    handleEdit={handleEdit}
                  />
                )}
                <Ends
                  value={value}
                  setValue={setValue}
                  handleEdit={handleEdit}
                />
              </View>
            )}

            <AtTime value={value} setValue={setValue} handleEdit={handleEdit} />
            <Preview value={value} />
          </View>
        </BottomSheetScrollView>
      </Modal>
    );
  }
);

