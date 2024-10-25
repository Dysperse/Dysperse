import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import {
  defaultRecurrenceOptions,
  DueDatePicker,
  RecurrencePicker,
} from "@/ui/DatePicker";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Modal from "@/ui/Modal";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback, useState } from "react";
import { Easing, Pressable } from "react-native";
import Accordion from "react-native-collapsible/Accordion";
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
        height={breakpoints.md ? 900 : "100%"}
      >
        <Header title={title} handleClose={handleClose} />
        <Accordion
          containerStyle={{ padding: 10, gap: 10  }}
          activeSections={activeSections}
          sectionContainerStyle={{
            backgroundColor: addHslAlpha(theme[5], 0.3),
            borderRadius: 20,
            overflow: "hidden",
          }}
          align="bottom"
          underlayColor="transparent"
          touchableComponent={Pressable as any}
          easing={Easing.bezier(0.17, 0.67, 0.32, 1)}
          sections={[
            {
              trigger: () => (
                <ListItemButton disabled>
                  <Icon>today</Icon>
                  <ListItemText primary="Due date" />
                </ListItemButton>
              ),
              content: (
                <DueDatePicker
                  watch={watch}
                  setValue={setValue}
                  value={dueDate}
                />
              ),
            },
            {
              trigger: () => (
                <ListItemButton disabled>
                  <Icon>loop</Icon>
                  <ListItemText primary="Repeats" />
                </ListItemButton>
              ),
              content: (
                <RecurrencePicker
                  defaultRecurrenceOptions={defaultRecurrenceOptions}
                  setValue={setValue}
                  value={recurrence}
                />
              ),
            },
          ].filter((e) => e)}
          renderHeader={(section) => section.trigger()}
          renderContent={(section) => section.content}
          onChange={setActiveSections}
        />
      </Modal>
    </>
  );
}

export default TaskDatePicker;
