import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { RRule } from "rrule";
import { DueDatePicker, RecurrencePicker } from ".";

function Header({ title }: { title: string }) {
  const theme = useColorTheme();
  return (
    <View
      style={{
        borderBottomWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderBottomColor: theme[5],
      }}
    >
      <Text
        style={{
          fontSize: 20,
          marginBottom: 10,
        }}
        weight={800}
      >
        {title}
      </Text>
    </View>
  );
}

export function TaskDatePicker({
  defaultView,
  setValue,
  watch,
  children,
  dueDateOnly,
  title,
}: {
  defaultView?: "date" | "recurrence";
  setValue: any;
  watch: any;
  children?: any;
  dueDateOnly?: boolean;
  title?: string;
}) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const sheetRef = useRef<BottomSheetModal>(null);
  const handleClose = useCallback(() => sheetRef.current?.close(), []);
  const handleOpen = useCallback(() => sheetRef.current?.present(), []);

  const dueDate = watch("date");
  const recurrence = watch("recurrenceRule");

  const [view, setView] = useState<"date" | "recurrence">(
    dueDateOnly ? "date" : defaultView || "date"
  );

  const trigger = cloneElement(
    children || (
      <Chip
        icon={<Icon>{recurrence ? "loop" : "calendar_today"}</Icon>}
        onDismiss={
          (recurrence || dueDate) &&
          (() => {
            setValue("date", null);
            setValue("recurrenceRule", null);
          })
        }
        label={
          recurrence
            ? capitalizeFirstLetter(new RRule(recurrence).toText())
            : dueDate
            ? dueDate.format("MMM Do")
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
      <BottomSheet
        snapPoints={["100%"]}
        sheetRef={sheetRef}
        onClose={handleClose}
        maxWidth={750}
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleComponent={() => null}
      >
        <Pressable onPress={handleClose} style={{ flex: 1 }}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              marginTop: "auto",
              backgroundColor: theme[2],
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingVertical: 15,
            }}
          >
            {title && <Header title={title} />}
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
                <DueDatePicker
                  watch={watch}
                  setValue={setValue}
                  value={dueDate}
                />
              ) : (
                <RecurrencePicker setValue={setValue} value={recurrence} />
              )}
            </BottomSheetScrollView>
          </Pressable>
        </Pressable>
      </BottomSheet>
    </>
  );
}
