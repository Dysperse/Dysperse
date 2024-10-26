import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import { DatePicker } from "@/ui/DatePicker";
import Icon from "@/ui/Icon";
import Modal from "@/ui/Modal";
import { RecurrencePicker } from "@/ui/RecurrencePicker";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback, useState } from "react";
import { RRule } from "rrule";

function TaskDatePicker({
  defaultView,
  setValue,
  watch,
  children,
  dueDateOnly,
  title,
  sheetRef: _sheetRef,
  defaultRecurrenceOptions,
}: {
  defaultView?: "date" | "recurrence";
  setValue: any;
  watch: any;
  children?: any;
  dueDateOnly?: boolean;
  title?: string;
  sheetRef?: React.MutableRefObject<BottomSheetModal>;
  defaultRecurrenceOptions?: any;
}) {
  const dateRef = React.useRef(null);
  const recurrenceRef = React.useRef(null);
  const date = watch("date");
  const end = watch("end");
  const recurrenceRule = watch("recurrenceRule");

  const breakpoints = useResponsiveBreakpoints();
  const _ref = React.useRef<BottomSheetModal>(null);
  const sheetRef = _sheetRef || _ref;

  const [activeSections, setActiveSections] = useState([0]);

  const handleClose = useCallback(
    () => sheetRef.current?.forceClose({ duration: 0.0001 }),
    [sheetRef]
  );
  const handleOpen = useCallback(() => sheetRef.current.present(), [sheetRef]);

  const dueDate = watch("date");
  const recurrence = watch("recurrenceRule");
  const dateOnly = watch("dateOnly");
  const theme = useColorTheme();

  const [view, setView] = useState<"date" | "recurrence">(
    dueDateOnly ? "date" : defaultView || "date"
  );

  const trigger = cloneElement(
    children || (
      <Chip
        outlined
        icon={<Icon>{recurrence ? "loop" : "calendar_today"}</Icon>}
        onDismiss={
          (recurrence || dueDate) &&
          (() => {
            setValue("date", null);
            setValue("recurrenceRule", null);
          })
        }
        style={({ pressed, hovered }) => ({
          borderWidth: 1,
          borderColor: addHslAlpha(
            theme[9],
            pressed ? 0.3 : hovered ? 0.2 : 0.1
          ),
        })}
        label={
          recurrence
            ? capitalizeFirstLetter(new RRule(recurrence).toText())
            : dueDate
            ? dueDate.format(dateOnly ? "MMM Do" : "MMM Do [@] h:mm a")
            : undefined
        }
      />
    ),
    {
      onPress: handleOpen,
    }
  );

  return (
    <>
      {trigger}
      <Modal
        snapPoints={["100%"]}
        sheetRef={sheetRef}
        animation="SCALE"
        maxWidth={320}
        height={breakpoints.md ? 210 : "100%"}
        innerStyles={{ gap: 10, padding: 20 }}
      >
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
        <Button
          onPress={() => dateRef.current?.present()}
          bold
          large
          height={80}
          variant="filled"
          icon="today"
          text="Set deadline"
        />
        {!dueDateOnly && (
          <Button
            onPress={() => recurrenceRef.current?.present()}
            bold
            large
            height={80}
            variant="filled"
            icon="loop"
            text="Set recurrence"
          />
        )}
      </Modal>
    </>
  );
}

export default TaskDatePicker;

