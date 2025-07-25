import { dysperseCalendarTheme } from "@/components/collections/navbar/AgendaCalendarMenu";
import { normalizeRecurrenceRuleObject } from "@/components/task/drawer/details";
import { BottomSheetScrollView, useBottomSheet } from "@gorhom/bottom-sheet";
import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Keyboard, View } from "react-native";
import Toast from "react-native-toast-message";
import { RRule } from "rrule";
import { Button, ButtonText } from "../Button";
import { useColorTheme } from "../color/theme-provider";
import Icon from "../Icon";
import IconButton from "../IconButton";
import { ListItemButton } from "../ListItemButton";
import ListItemText from "../ListItemText";
import MenuPopover from "../MenuPopover";
import Modal from "../Modal";
import Text from "../Text";
import TextField from "../TextArea";

const Every = ({ value, handleEdit }: { value; handleEdit }) => {
  const frequency = value.freq;
  const interval = value.interval;

  return (
    <View>
      <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 0 }}>
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
            textAlign: "center",
          }}
          selectTextOnFocus
          weight={800}
          variant="filled"
          keyboardType="number-pad"
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
                ]?.replace("s", interval === 1 ? "" : "s")}
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

const getWeekOfMonthOrdinal = (date) => {
  const wom = date.week() - date.startOf("month").week() + 1;
  return date.date(wom).format("Do");
};

function On({ value, handleEdit }) {
  const theme = useColorTheme();
  const isMonthly = value.freq === 1;

  const days = [
    { value: 6, text: "S" },
    { value: 0, text: "M" },
    { value: 1, text: "T" },
    { value: 2, text: "W" },
    { value: 3, text: "T" },
    { value: 4, text: "F" },
    { value: 5, text: "S" },
  ];

  return (
    <>
      <Text variant="eyebrow" style={{ marginTop: 20, marginBottom: -5 }}>
        ON
      </Text>
      {isMonthly && (
        <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
          <Button
            containerStyle={{ flexGrow: 1 }}
            variant="filled"
            bold
            large
            text={`The ${dayjs().format("Do")} day`}
            onPress={() => {
              handleEdit(
                "bymonth",
                [...new Array(12)].map((e, i) => i)
              );
            }}
          />
          <Button
            containerStyle={{ flexGrow: 1 }}
            variant="filled"
            bold
            large
            text={`The ${getWeekOfMonthOrdinal(dayjs())} ${dayjs().format(
              "dddd"
            )}`}
          />
        </View>
      )}
      {value.freq === 2 && (
        <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
          {days.map((e, index) => {
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
                        : [
                            ...value[isMonthly ? "bymonth" : "byweekday"],
                            e.value,
                          ]
                      : [
                          ...new Set(
                            [
                              ...(value?.[
                                isMonthly ? "bymonth" : "byweekday"
                              ] || []),
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
      )}
    </>
  );
}

const SetValue = ({ value, setValue }: { value: any; setValue: any }) => {
  useEffect(() => {
    Keyboard.dismiss();
  }, []);

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

function Ends({ value, setValue }) {
  const theme = useColorTheme();
  const endsInputDateRef = useRef(null);
  const endsInputCountRef = useRef(null);

  return (
    <>
      <Text variant="eyebrow" style={{ marginTop: 20 }}>
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
          <ListItemText
            truncate
            primary="Never"
            primaryProps={{ style: { color: theme[11] } }}
          />
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
          <ListItemText
            truncate
            primary="On"
            primaryProps={{ style: { color: theme[11] } }}
          />
          <TextField
            inputRef={endsInputDateRef}
            variant="outlined"
            placeholder="dd/mm"
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
          <ListItemText
            truncate
            primary="After"
            primaryProps={{ style: { color: theme[11] } }}
          />
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
          <Text weight={600} style={{ color: theme[11] }}>
            times
          </Text>
        </ListItemButton>
      </View>
    </>
  );
}

function Preview({ value }) {
  const theme = useColorTheme();
  const [show, setShow] = useState(false);
  const [previewRange] = useState<Date>(new Date());

  return !value ? null : (
    <View style={{ marginTop: 30 }}>
      <Button
        onPress={() => setShow((t) => !t)}
        containerStyle={{ marginLeft: -10 }}
      >
        <Text variant="eyebrow">Show preview</Text>
        <Icon>expand_more</Icon>
      </Button>
      {show && (
        <View
          style={{
            borderWidth: 1,
            borderColor: theme[4],
            borderRadius: 25,
            pointerEvents: "none",
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
                dayjs(previewRange)
                  .utc()
                  .endOf("month")
                  .add(1, "month")
                  .toDate()
              )
              .map((date) => ({
                startId: toDateId(date),
                endId: toDateId(date),
              }))}
          />
        </View>
      )}
    </View>
  );
}

function Cancel({ setValue, onClose }) {
  const { forceClose } = useBottomSheet();

  return (
    <Button
      dense
      onPress={() => {
        forceClose();
        setTimeout(() => setValue(null), 100);
        setTimeout(() => onClose(), 100);
      }}
    >
      <ButtonText>Clear</ButtonText>
    </Button>
  );
}

export const RecurrencePicker = ({
  value,
  setValue,
  onClose = () => {},
  ref,
}: {
  value: any;
  setValue: any;
  onClose?: any;
  ref: any;
}) => {
  const [localValue, setLocalValue] = useState(value);

  const handleEdit = (key, newValue) => {
    setLocalValue({
      ...localValue,
      [key]: newValue,
    });
  };

  return (
    <Modal sheetRef={ref} animation="SCALE" maxWidth={400} onClose={onClose}>
      <View
        style={{
          padding: 20,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Cancel setValue={setLocalValue} onClose={onClose} />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            style={{
              fontSize: 20,
              textAlign: "center",
              fontFamily: "serifText700",
            }}
          >
            Repetition
          </Text>
        </View>
        <IconButton
          icon="check"
          style={{ marginLeft: 20 }}
          size={40}
          variant="filled"
          onPress={() => {
            ref.current.close();
            setValue(localValue);
            setTimeout(onClose, 100);
          }}
        />
      </View>
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <SetValue value={localValue} setValue={setLocalValue} />
        <View style={{ padding: 20, paddingTop: 0 }}>
          {localValue && (
            <View style={{ paddingTop: 10, gap: 10 }}>
              <Every value={localValue} handleEdit={handleEdit} />
              {localValue.freq !== 0 && (
                <On value={localValue} handleEdit={handleEdit} />
              )}
              <Ends value={localValue} setValue={setLocalValue} />
            </View>
          )}
          <Preview value={localValue} />
        </View>
      </BottomSheetScrollView>
    </Modal>
  );
};

