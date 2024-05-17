import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback, useRef, useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { TaskDrawerContent } from "./content";
import { TaskDrawerContext } from "./context";

export function TaskDrawer({
  mutateList,
  children,
  id,
  disabled,
  isReadOnly,
  dateRange,
}: {
  mutateList: any;
  children: any;
  id: any;
  disabled?: boolean;
  isReadOnly?: boolean;
  dateRange?: [Date, Date];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<BottomSheetModal>(null);
  const { width, height } = useWindowDimensions();
  const { sessionToken } = useUser();

  // Fetch data
  const { data, mutate, error } = useSWR(
    open ? ["space/entity", { id }] : null
  );

  // callbacks
  const handleOpen = useCallback((e) => {
    ref.current.present();
    setOpen(true);
  }, []);

  const handleClose = useCallback(
    (shouldMutate = true) => {
      ref.current?.forceClose();
      if (shouldMutate) mutateList(data);
    },
    [mutateList, data]
  );

  const trigger = cloneElement(children, { onPress: handleOpen });
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const updateTask = useCallback(
    async (key, value, sendRequest = true) => {
      const oldData = data;
      const newData = {
        ...data,
        [key]: value,
      };
      mutate(newData, {
        revalidate: false,
        populateCache: newData,
      });
      if (!sendRequest) return;
      await sendApiRequest(
        sessionToken,
        "PUT",
        "space/entity",
        {},
        {
          body: JSON.stringify({
            id,
            [key]: value,
          }),
        }
      ).catch(() => {
        mutate(oldData, false);
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later.",
        });
      });
    },
    [data, mutate, id, sessionToken]
  );

  if (disabled) return children;

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        animateOnMount={!breakpoints.md}
        snapPoints={["100%"]}
        onClose={handleClose}
        style={{ width: "100%" }}
        maxWidth={width}
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleComponent={() => null}
        maxBackdropOpacity={0.1}
        {...(breakpoints.md && {
          maxBackdropOpacity: 0.05,
          animationConfigs: {
            overshootClamping: true,
            duration: 0.0001,
          },
        })}
      >
        <Pressable
          onPress={() => {
            handleClose();
          }}
          style={{
            flex: 1,
            height: "100%",
            padding: 10,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              breakpoints.md && {
                margin: "auto",
                width: 500,
                height: Math.min(700, height - 100),
                shadowRadius: 50,
                shadowOffset: {
                  width: 20,
                  height: 20,
                },
                shadowColor: "rgba(0,0,0,0.12)",
                overflow: "hidden",
              },
              {
                borderWidth: 1,
                borderColor: theme[6],
                backgroundColor: theme[2],
                marginTop: "auto",
                paddingTop: 15,
                borderRadius: 25,
              },
            ]}
          >
            <View
              style={{
                width: 25,
                height: 5,
                backgroundColor: theme[5],
                borderRadius: 999,
                marginHorizontal: "auto",
                marginBottom: 10,
              }}
            />
            {data?.id ? (
              <TaskDrawerContext.Provider
                value={{
                  dateRange,
                  task: data,
                  updateTask,
                  mutateList,
                  isReadOnly,
                }}
              >
                <TaskDrawerContent handleClose={handleClose} />
              </TaskDrawerContext.Provider>
            ) : error ? (
              <View style={{ padding: 20 }}>
                <ErrorAlert />
              </View>
            ) : (
              <View
                style={{
                  height: "100%",
                  minHeight: height * 0.65 - 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Spinner />
              </View>
            )}
          </Pressable>
        </Pressable>
      </BottomSheet>
    </>
  );
}
