import { DatePicker } from "@/ui/DatePicker";
import { RecurrencePicker } from "@/ui/RecurrencePicker";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback } from "react";
import { Pressable } from "react-native";

function TaskDatePicker({
  setValue,
  watch,
  children,
  dueDateOnly,
  sheetRef: _sheetRef,
}: {
  setValue: any;
  watch: any;
  children?: any;
  dueDateOnly?: boolean;
  title?: string;
  sheetRef?: React.MutableRefObject<BottomSheetModal>;
}) {
  const dateRef = React.useRef(null);
  const recurrenceRef = React.useRef(null);
  const date = watch("date");
  const end = watch("end");
  const recurrenceRule = watch("recurrenceRule");

  const dueDate = watch("date");
  const dateOnly = watch("dateOnly");

  const handleOpen = useCallback(() => {
    if (recurrenceRule) recurrenceRef.current?.present();
    else if (dueDate || dueDateOnly) dateRef.current?.present();
  }, [dueDate, dueDateOnly, recurrenceRule]);

  const trigger = cloneElement(children || <Pressable />, {
    onPress: handleOpen,
  });

  return (
    <>
      {trigger}
      <DatePicker
        ref={dateRef}
        value={{ date, dateOnly, end }}
        setValue={setValue}
      />
      <RecurrencePicker
        ref={recurrenceRef}
        value={recurrenceRule}
        setValue={(t: any) => setValue("recurrenceRule", t)}
      />
    </>
  );
}

export default TaskDatePicker;

