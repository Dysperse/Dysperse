import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import { Modal } from "@/ui/Modal";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback, useState } from "react";
import { View } from "react-native";
import { RRule } from "rrule";
import { defaultRecurrenceOptions, DueDatePicker, RecurrencePicker } from ".";

function Header({ title, handleClose }: { title: string; handleClose: any }) {
  const theme = useColorTheme();
  return (
    <View
      style={{
        borderBottomWidth: 1,
        marginBottom: 10,
        paddingLeft: 30,
        paddingRight: 20,
        paddingVertical: 10,
        borderBottomColor: theme[5],
        backgroundColor: theme[3],
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 20,
          flex: 1,
        }}
        weight={800}
      >
        {title || "Edit"}
      </Text>
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
    </View>
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
        ref={sheetRef}
        animation="SCALE"
        maxWidth={750}
        height={breakpoints.md ? 485 : "100%"}
      >
        <Header title={title} handleClose={handleClose} />
        <BottomSheetScrollView>
          {dueDateOnly !== true && (
            <ButtonGroup
              options={[
                { value: "date", label: "Date" },
                { value: "recurrence", label: "Repeat" },
              ]}
              state={[view, setView]}
              containerStyle={{ marginBottom: breakpoints.md ? 0 : 20 }}
            />
          )}
          {view === "date" ? (
            <DueDatePicker watch={watch} setValue={setValue} value={dueDate} />
          ) : (
            <RecurrencePicker
              defaultRecurrenceOptions={defaultRecurrenceOptions}
              setValue={setValue}
              value={recurrence}
            />
          )}
        </BottomSheetScrollView>
      </Modal>
    </>
  );
}

export default TaskDatePicker;

