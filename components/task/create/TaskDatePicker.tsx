import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import { defaultRecurrenceOptions } from "@/ui/DatePicker";
import Icon from "@/ui/Icon";
import Modal from "@/ui/Modal";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback, useState } from "react";
import { RRule } from "rrule";

function Header({ title, handleClose }: { title: string; handleClose: any }) {
  const theme = useColorTheme();
  return (
    <Button
      variant="filled"
      style={({ pressed, hovered }) => ({
        backgroundColor: theme[pressed ? 6 : hovered ? 5 : 4],
      })}
      containerStyle={{ width: 120 }}
      onPress={handleClose}
    >
      <ButtonText>Done</ButtonText>
      <Icon>check</Icon>
    </Button>
  );
}

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
  defaultRecurrenceOptions?: defaultRecurrenceOptions;
}) {
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
        height={breakpoints.md ? 300 : "100%"}
        innerStyles={{ gap: 10, padding: 20 }}
      >
        <Button
          bold
          large
          height={80}
          variant="filled"
          icon="today"
          text="Set deadline"
        />
        <Button
          bold
          large
          height={80}
          variant="filled"
          icon="loop"
          text="Set recurrence"
        />
        <Button
          large
          height={80}
          variant="outlined"
          icon="close"
          text="Cancel"
        />
      </Modal>
    </>
  );
}

export default TaskDatePicker;

