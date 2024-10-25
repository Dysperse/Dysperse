// import { dysperseCalendarTheme } from "@/components/collections/navbar/AgendaCalendarMenu";
// import { normalizeRecurrenceRuleObject } from "@/components/task/drawer/details";
// import { useUser } from "@/context/useUser";
// import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
// import Chip from "@/ui/Chip";
// import Icon from "@/ui/Icon";
// import IconButton from "@/ui/IconButton";
// import { ListItemButton } from "@/ui/ListItemButton";
// import ListItemText from "@/ui/ListItemText";
// import MenuPopover from "@/ui/MenuPopover";
// import Text from "@/ui/Text";
// import TextField from "@/ui/TextArea";
// import { addHslAlpha } from "@/ui/color";
// import { useColorTheme } from "@/ui/color/theme-provider";
// import {
//   Calendar,
//   fromDateId,
//   toDateId,
// } from "@marceloterreiro/flash-calendar";
import convertTime from "convert-time";
// import dayjs, { Dayjs } from "dayjs";
// import React, { RefObject, useEffect, useMemo, useRef, useState } from "react";
// import { InteractionManager, Pressable, View } from "react-native";
// import { ScrollView, TextInput } from "react-native-gesture-handler";
// import Toast from "react-native-toast-message";
// import { Options, RRule } from "rrule";

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
    const breakpoints = useResponsiveBreakpoints();
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
          width: breakpoints.md ? 100 : "100%",
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

// export const DueDatePicker = ({ watch, value, setValue }) => {
//   const breakpoints = useResponsiveBreakpoints();
//   const theme = useColorTheme();
//   const dateOnly = watch("dateOnly");
//   const endDate = watch("end");
//   const timeInputRef = useRef<TextInput>(null);
//   const endTimeInputRef = useRef<TextInput>(null);

//   useEffect(() => {
//     if (endDate && dayjs(endDate).isBefore(dayjs(value))) {
//       setValue("end", dayjs(value).add(1, "hour").minute(0));
//       Toast.show({ type: "error", text1: "End time must be after start time" });
//       InteractionManager.runAfterInteractions(() => {
//         endTimeInputRef.current?.focus();
//       });
//     }
//   }, [dateOnly, setValue, endDate, value]);

//   const quickDates = useMemo(
//     () => [
//       { label: "Today", value: dayjs().startOf("day").utc() },
//       { label: "Tomorrow", value: dayjs().add(1, "day").utc() },
//       { label: "In 2 days", value: dayjs().add(2, "day").utc() },
//       { label: "Next week", value: dayjs().add(1, "week").utc() },
//     ],
//     []
//   );

//   const [calendarMonthId, setCalendarMonthId] = useState(
//     toDateId(
//       dayjs(
//         dayjs(value).isValid() ? value.toISOString() : dayjs().toISOString()
//       ).toDate()
//     )
//   );

//   useEffect(() => {
//     setCalendarMonthId(
//       toDateId(
//         dayjs(
//           dayjs(value).isValid() ? value.toISOString() : dayjs().toISOString()
//         ).toDate()
//       )
//     );
//   }, [value]);

//   return (
//     <View
//       style={{
//         flexDirection: "column-reverse",
//         gap: 10,
//         padding: 10,
//         paddingTop: breakpoints.md ? 20 : 0,
//         paddingHorizontal: 20,
//         paddingBottom: 20,
//       }}
//     >
//       <View
//         style={{
//           flex: breakpoints.md ? 1 : undefined,
//           borderColor: theme[6],
//           borderWidth: 2,
//           borderRadius: 25,
//           padding: 10,
//         }}
//       >
//         <View
//           style={{
//             flexDirection: "row",
//             marginBottom: -20,
//             zIndex: 99,
//             justifyContent: "space-between",
//           }}
//         >
//           <IconButton
//             icon="arrow_back"
//             onPress={() =>
//               setCalendarMonthId(
//                 toDateId(
//                   dayjs(fromDateId(calendarMonthId).toISOString())
//                     .subtract(1, "month")
//                     .toDate()
//                 )
//               )
//             }
//           />
//           <IconButton
//             icon="arrow_forward"
//             onPress={() =>
//               setCalendarMonthId(
//                 toDateId(
//                   dayjs(fromDateId(calendarMonthId).toISOString())
//                     .add(1, "month")
//                     .toDate()
//                 )
//               )
//             }
//           />
//         </View>
//         <Calendar
//           calendarMonthId={calendarMonthId}
//           theme={{
//             ...dysperseCalendarTheme(theme),
//             rowMonth: {
//               content: {
//                 textAlign: "center",
//                 textTransform: "uppercase",
//                 marginTop: -15,
//                 color: addHslAlpha(theme[11], 0.5),
//                 fontFamily: "body_900",
//               },
//             },
//           }}
//           onCalendarDayPress={(date) => {
//             setValue("date", dayjs(fromDateId(date).toISOString()));
//           }}
//           calendarActiveDateRanges={
//             value
//               ? [
//                   {
//                     startId: toDateId(dayjs(value.toISOString()).toDate()),
//                     endId: toDateId(dayjs(value.toISOString()).toDate()),
//                   },
//                 ]
//               : []
//           }
//         />
//         <ScrollView
//           keyboardShouldPersistTaps="handled"
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{ gap: 10, padding: 10 }}
//         >
//           {quickDates.map((date, i) => (
//             <Chip
//               key={i}
//               outlined={value?.toString() !== date.value.toString()}
//               label={date.label}
//               onPress={() => setValue("date", date.value)}
//               icon={
//                 value?.toString() === date.value.toString() && (
//                   <Icon filled>check</Icon>
//                 )
//               }
//             />
//           ))}
//         </ScrollView>
//       </View>
//       {value ? (
//         <View
//           style={{
//             flex: breakpoints.md ? 1 : undefined,
//             alignItems: "center",
//             padding: 10,
//             justifyContent: "center",
//           }}
//         >
//           <Text weight={800} style={{ fontSize: 25, textAlign: "center" }}>
//             {dayjs(value).format("dddd, MMMM Do")}
//           </Text>
//           <Text style={{ fontSize: 20, opacity: 0.6, marginBottom: 20 }}>
//             {dayjs(value).isToday() ? "Today" : dayjs(value).fromNow()}
//           </Text>
//           <ListItemButton
//             onPress={() => {
//               setValue("dateOnly", !dateOnly);
//               if (dateOnly)
//                 setTimeout(() => {
//                   timeInputRef.current?.focus();
//                 }, 10);
//             }}
//             style={{ height: 40 }}
//           >
//             {dateOnly ? (
//               <ListItemText
//                 primaryProps={{ style: { color: theme[11] } }}
//                 primary={dateOnly ? "All day" : dayjs(value).format("h:mm A")}
//               />
//             ) : (
//               <Pressable
//                 style={{ flex: 1 }}
//                 onPress={(e) => e.stopPropagation()}
//               >
//                 <TimeInput
//                   ref={timeInputRef}
//                   value={value}
//                   setValue={setValue}
//                 />
//               </Pressable>
//             )}
//             <Icon size={30} style={!dateOnly && { opacity: 0.6 }}>
//               toggle_{dateOnly ? "on" : "off"}
//             </Icon>
//           </ListItemButton>
//           <ListItemButton
//             onPress={() => {
//               if (dateOnly)
//                 Toast.show({ type: "error", text1: "Add a time first" });
//               else
//                 setTimeout(() => {
//                   endTimeInputRef.current?.focus();
//                   if (!endDate)
//                     setValue("end", dayjs(value).add(1, "hour").minute(0));
//                   else setValue("end", null);
//                 }, 10);
//             }}
//             style={{ height: 40 }}
//           >
//             {!dateOnly && endDate ? (
//               <Pressable
//                 style={{ flex: 1 }}
//                 onPress={(e) => e.stopPropagation()}
//               >
//                 <TimeInput
//                   ref={endTimeInputRef}
//                   value={endDate}
//                   setValue={setValue}
//                   valueKey="end"
//                   key={dayjs(endDate).format("h:mm A")}
//                 />
//               </Pressable>
//             ) : (
//               <ListItemText
//                 primaryProps={{ style: { color: theme[11] } }}
//                 primary={
//                   !dateOnly && endDate
//                     ? dayjs(value).format("h:mm A")
//                     : "Add end time"
//                 }
//               />
//             )}
//             <Icon size={30} style={!dateOnly && { opacity: 0.6 }}>
//               {endDate ? "delete" : "add"}
//             </Icon>
//           </ListItemButton>
//           <ListItemButton
//             onPress={() => setValue("date", null)}
//             style={{ height: 40 }}
//           >
//             <ListItemText
//               primaryProps={{ style: { color: theme[11] } }}
//               primary="Clear"
//             />
//             <Icon>remove_circle</Icon>
//           </ListItemButton>
//         </View>
//       ) : (
//         <View
//           style={{
//             flex: 1,
//             alignItems: "center",
//             justifyContent: "center",
//             opacity: 0.6,
//             padding: 10,
//           }}
//         >
//           <Text weight={900} style={{ fontSize: 20 }}>
//             No date set
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };
// export type defaultRecurrenceOptions = {
//   dtstart?: string;
// };

// export function RecurrencePicker({
//   value,
//   setValue,
//   defaultRecurrenceOptions,
// }: {
//   value: any;
//   setValue: any;
//   defaultRecurrenceOptions?: defaultRecurrenceOptions;
// }): React.JSX.Element {
//   const theme = useColorTheme();
//   const breakpoints = useResponsiveBreakpoints();
//   const { session } = useUser();
//   const defaultOptions = useMemo(
//     (): Partial<Options> => ({
//       freq: RRule.WEEKLY,
//       byweekday: [dayjs().day() - 1],
//       dtstart: dayjs(defaultRecurrenceOptions?.dtstart)
//         .utc()
//         .startOf("day")
//         .toDate(),
//       wkst: session?.space?.space?.weekStart === "SUNDAY" ? RRule.SU : RRule.MO,
//     }),
//     [session, defaultRecurrenceOptions]
//   );

//   const recurrenceRule = normalizeRecurrenceRuleObject(
//     value || normalizeRecurrenceRuleObject(defaultOptions).options
//   );

//   const [previewRange, setPreviewRange] = useState<Date>(new Date());
//   const endsInputCountRef = useRef<TextInput>(null);
//   const endsInputDateRef = useRef<TextInput>(null);

//   const handleEdit = (key, newValue) => {
//     setValue("recurrenceRule", {
//       ...value,
//       [key]: newValue,
//     });
//   };

//   const quickRules = useMemo(
//     () => [
//       { label: "Every day", value: new RRule({ freq: RRule.DAILY }) },
//       {
//         label: `Every ${dayjs().format("dddd")}`,
//         value: new RRule({ freq: RRule.WEEKLY }),
//       },
//       {
//         label: `Monthly on the ${dayjs().format("Do")}`,
//         value: new RRule({ freq: RRule.MONTHLY }),
//       },
//       {
//         label: `Yearly on ${dayjs().format("MMM Do")}`,
//         value: new RRule({ freq: RRule.YEARLY }),
//       },
//     ],
//     []
//   );

//   return (
//     <>
//       {recurrenceRule && (
//         <View
//           style={{
//             flexDirection: breakpoints.md ? "row" : "column",
//             paddingHorizontal: 20,
//             gap: 20,
//           }}
//         >
//           <View style={{ flex: breakpoints.md ? 1 : undefined }}>
//             <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 20 }}>
//               Repeat every
//             </Text>
//             <View
//               style={{
//                 borderWidth: 1,
//                 borderColor: theme[6],
//                 backgroundColor: theme[3],
//                 borderRadius: 15,
//                 flexDirection: "row",
//               }}
//             >
//               <TextField
//                 placeholder="1"
//                 style={{ flex: 1, paddingHorizontal: 20 }}
//                 defaultValue={value?.interval || 1}
//                 onChange={(e) => {
//                   const t = e.nativeEvent.text;
//                   if (parseInt(t) && parseInt(t) > 0)
//                     handleEdit("interval", parseInt(e.nativeEvent.text));
//                 }}
//               />
//               <MenuPopover
//                 options={[
//                   { text: "Daily", value: RRule.DAILY },
//                   { text: "Week", value: RRule.WEEKLY },
//                   { text: "Month", value: RRule.MONTHLY },
//                   { text: "Year", value: RRule.YEARLY },
//                 ].map((e) => ({
//                   ...e,
//                   callback: () => {
//                     setValue(
//                       "recurrenceRule",
//                       new RRule({
//                         freq: e.value,
//                         interval: value?.interval || 1,
//                       }).options
//                     );
//                   },
//                   selected: value?.freq === e.value,
//                 }))}
//                 trigger={
//                   <ListItemButton style={{ height: 40 }}>
//                     <ListItemText
//                       truncate
//                       primary={
//                         ["days", "weeks", "months", "years"][3 - value?.freq]
//                       }
//                     />
//                     <Icon>expand_more</Icon>
//                   </ListItemButton>
//                 }
//               />
//             </View>
//             <>
//               <Text
//                 variant="eyebrow"
//                 style={{ marginTop: 20, marginBottom: 5 }}
//               >
//                 ON
//               </Text>
//               <View style={{ flexDirection: "row", gap: 10 }}>
//                 <MenuPopover
//                   menuProps={{ style: { flex: 1 } }}
//                   options={[
//                     { value: 6, text: "Sunday" },
//                     { value: 0, text: "Monday" },
//                     { value: 1, text: "Tuesday" },
//                     { value: 2, text: "Wednesday" },
//                     { value: 3, text: "Thursday" },
//                     { value: 4, text: "Friday" },
//                     { value: 5, text: "Saturday" },
//                   ].map((e) => ({
//                     ...e,
//                     callback: () => {
//                       handleEdit(
//                         "byweekday",
//                         (value.byweekday
//                           ? value.byweekday.includes(e.value)
//                             ? value.byweekday.filter((day) => day !== e.value)
//                             : [...value.byweekday, e.value]
//                           : [
//                               ...new Set(
//                                 [...(value?.byweekday || []), e.value].sort()
//                               ),
//                             ]
//                         ).sort()
//                       );
//                     },
//                     selected: value?.byweekday?.includes(e.value),
//                   }))}
//                   closeOnSelect={false}
//                   trigger={
//                     <ListItemButton
//                       style={{ height: 60, flex: 1 }}
//                       variant="filled"
//                     >
//                       <Icon>wb_sunny</Icon>
//                       <ListItemText
//                         truncate
//                         primary={
//                           value?.byweekday?.length === 0 || !value?.byweekday
//                             ? "All days"
//                             : `${value?.byweekday?.length || 0} day${
//                                 value?.byweekday?.length === 1 ? "" : "s"
//                               }`
//                         }
//                         secondary="Select days"
//                       />
//                     </ListItemButton>
//                   }
//                 />
//               </View>
//             </>
//             <Text variant="eyebrow" style={{ marginTop: 20, marginBottom: 5 }}>
//               Ends
//             </Text>
//             <ListItemButton
//               style={{ height: 40 }}
//               variant={!value?.until && !value?.count ? "filled" : null}
//               onPress={() => {
//                 setValue("recurrenceRule", {
//                   ...value,
//                   until: null,
//                   count: null,
//                 });
//                 endsInputDateRef.current?.clear();
//                 endsInputCountRef.current?.clear();
//               }}
//             >
//               <Icon>
//                 {!value?.until && !value?.count
//                   ? "radio_button_checked"
//                   : "radio_button_unchecked"}
//               </Icon>
//               <ListItemText truncate primary="Never" />
//             </ListItemButton>
//             <ListItemButton
//               style={{ height: 40 }}
//               variant={value?.until && !value?.count ? "filled" : null}
//               onPress={() => {
//                 setTimeout(() => {
//                   endsInputDateRef.current?.focus();
//                 }, 0);
//               }}
//             >
//               <Icon>
//                 {value?.until && !value?.count
//                   ? "radio_button_checked"
//                   : "radio_button_unchecked"}
//               </Icon>
//               <ListItemText truncate primary="On" />
//               <TextField
//                 inputRef={endsInputDateRef}
//                 variant="outlined"
//                 placeholder="Date"
//                 style={{ padding: 4, borderRadius: 5 }}
//                 defaultValue={
//                   value?.until ? dayjs(value?.until).format("MM/DD/YYYY") : ""
//                 }
//                 onBlur={(e) => {
//                   let n = dayjs(e.nativeEvent.text);
//                   if (
//                     n.year() === 2001 &&
//                     !e.nativeEvent.text.split(" ").includes("2001")
//                   ) {
//                     n = n.year(dayjs().year());
//                   }
//                   if (n.isValid()) {
//                     endsInputCountRef.current?.clear();
//                     setValue("recurrenceRule", {
//                       ...value,
//                       until: n.toDate(),
//                       count: null,
//                     });
//                   } else if (e.nativeEvent.text) {
//                     endsInputDateRef.current?.clear();
//                     Toast.show({
//                       type: "error",
//                       text1: "Please type a valid date",
//                     });
//                   }
//                 }}
//               />
//             </ListItemButton>
//             <ListItemButton
//               style={{ height: 40 }}
//               variant={value?.count && !value?.until ? "filled" : null}
//               onPress={() => {
//                 setTimeout(() => {
//                   endsInputCountRef.current?.focus();
//                 }, 0);
//               }}
//             >
//               <Icon>
//                 {value?.count && !value?.until
//                   ? "radio_button_checked"
//                   : "radio_button_unchecked"}
//               </Icon>
//               <ListItemText truncate primary="After" />
//               <TextField
//                 inputRef={endsInputCountRef}
//                 variant="outlined"
//                 placeholder="#"
//                 style={{ padding: 4, borderRadius: 5, width: 50 }}
//                 onBlur={(e) => {
//                   const n = parseInt(e.nativeEvent.text);
//                   if (n === 0) endsInputCountRef.current?.clear();
//                   if (n && !isNaN(n)) {
//                     endsInputDateRef.current?.clear();
//                     setValue("recurrenceRule", {
//                       ...value,
//                       until: null,
//                       count: n === 0 ? null : n,
//                     });
//                   } else if (e.nativeEvent.text) {
//                     endsInputCountRef.current?.clear();
//                     Toast.show({
//                       type: "error",
//                       text1: "Please type a number",
//                     });
//                   }
//                 }}
//               />
//               <ListItemText truncate primary="times" />
//             </ListItemButton>
//           </View>
//           <View
//             style={{
//               padding: 10,
//               flex: breakpoints.md ? 1 : undefined,
//             }}
//           >
//             <View
//               style={{
//                 marginTop: breakpoints.md ? 0 : 30,
//                 borderWidth: 2,
//                 borderColor: theme[6],
//                 borderRadius: 25,
//                 padding: 10,
//                 flex: 1,
//               }}
//             >
//               <Calendar
//                 onCalendarDayPress={() => {}}
//                 calendarMonthId={toDateId(previewRange)}
//                 theme={dysperseCalendarTheme(theme)}
//                 calendarActiveDateRanges={recurrenceRule
//                   .between(
//                     dayjs(previewRange)
//                       .startOf("month")
//                       .subtract(1, "month")
//                       .utc()
//                       .toDate(),
//                     dayjs(previewRange)
//                       .utc()
//                       .endOf("month")
//                       .add(1, "month")
//                       .toDate()
//                   )
//                   .map((date) => ({
//                     startId: toDateId(date),
//                     endId: toDateId(date),
//                   }))}
//               />
//               <ScrollView
//                 keyboardShouldPersistTaps="handled"
//                 showsHorizontalScrollIndicator={false}
//                 horizontal
//                 contentContainerStyle={{ gap: 10, padding: 10 }}
//               >
//                 {quickRules.map((date, i) => (
//                   <Chip
//                     key={i}
//                     outlined={value?.toString() !== date.value.toString()}
//                     label={date.label}
//                     onPress={() =>
//                       setValue("recurrenceRule", date.value.options)
//                     }
//                     icon={
//                       value?.toString() === date.value.toString() && (
//                         <Icon filled>check</Icon>
//                       )
//                     }
//                   />
//                 ))}
//               </ScrollView>
//             </View>
//           </View>
//         </View>
//       )}
//     </>
//   );
// }

import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import dayjs, { Dayjs } from "dayjs";
import { forwardRef, RefObject, useState } from "react";
import { View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Button } from "../Button";
import IconButton from "../IconButton";
import Modal from "../Modal";
import Text from "../Text";
import TextField from "../TextArea";

export const DatePicker = forwardRef(
  ({ value, setValue }: { value: any; setValue: any }, ref: any) => {
    return (
      <Modal sheetRef={ref} animation="SCALE">
        <View style={{ padding: 20 }}>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text weight={800} style={{ fontSize: 20 }}>
              Select a date
            </Text>
            <IconButton icon="close" size={40} variant="filled" />
          </View>

          <View style={{ paddingTop: 20 }}>
            <Button
              icon="toggle_on"
              text="All day"
              iconPosition="end"
              variant="filled"
            />
          </View>
        </View>
      </Modal>
    );
  }
);
