import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RRule } from "rrule";
import { DueDatePicker, RecurrencePicker } from ".";

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
}: {
  defaultView?: "date" | "recurrence";
  setValue: any;
  watch: any;
  children?: any;
  dueDateOnly?: boolean;
  title?: string;
  sheetRef?: React.MutableRefObject<BottomSheetModal>;
}) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();
  const _ref = React.useRef<BottomSheetModal>(null);
  const sheetRef = _sheetRef || _ref;

  const handleClose = useCallback(
    () => sheetRef.current?.forceClose(),
    [sheetRef]
  );
  const handleOpen = useCallback(() => sheetRef.current.present(), [sheetRef]);

  const dueDate = watch("date");
  const recurrence = watch("recurrenceRule");
  const dateOnly = watch("dateOnly");

  const [view, setView] = useState<"date" | "recurrence">(
    dueDateOnly ? "date" : defaultView || "date"
  );

  const trigger = cloneElement(
    children || (
      <Chip
        outlined={!recurrence && !dueDate}
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
      <BottomSheet
        snapPoints={["100%"]}
        sheetRef={sheetRef}
        onClose={handleClose}
        maxWidth={"100%"}
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleComponent={() => null}
        animateOnMount={!breakpoints.md}
        {...(breakpoints.md && {
          handleComponent: () => null,
          maxBackdropOpacity: 0.1,
          animationConfigs: {
            overshootClamping: true,
            duration: 0.0001,
          },
        })}
      >
        <Pressable
          onPress={handleClose}
          style={{
            flex: 1,
            padding: 20,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              marginVertical: "auto",
              backgroundColor: theme[2],
              borderRadius: 20,
              paddingBottom: 15,
              maxWidth: 750,
              width: "100%",
              overflow: "hidden",
              marginHorizontal: "auto",
              maxHeight: "100%",
              shadowRadius: 50,
              shadowOffset: {
                width: 20,
                height: 20,
              },
              shadowColor: "rgba(0,0,0,0.12)",
            }}
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

export default TaskDatePicker;
