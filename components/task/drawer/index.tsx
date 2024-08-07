import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import { useColorTheme } from "@/ui/color/theme-provider";
import React, {
  cloneElement,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { TaskDrawerContent } from "./content";
import { TaskDrawerContext } from "./context";

const TaskDrawerWrapper = forwardRef(function TaskDrawerWrapper(
  {
    id,
    handleClose,
    dateRange,
    mutateList,
    isReadOnly,
  }: {
    id: any;
    handleClose: any;
    dateRange?: string;
    mutateList: any;
    isReadOnly?: boolean;
  },
  ref
) {
  const { height } = useWindowDimensions();
  const { sessionToken } = useUser();

  // Fetch data
  const { data, mutate, error } = useSWR(["space/entity", { id }]);
  const insets = useSafeAreaInsets();

  const breakpoints = useResponsiveBreakpoints();

  useImperativeHandle(ref, () => ({
    triggerMutate: () => mutateList(data),
  }));

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

  return (
    <Pressable
      onPress={() => handleClose()}
      style={{
        flex: 1,
        padding: 10,
        paddingTop: breakpoints.md ? 10 : 100,
        paddingBottom: insets.bottom + 10,
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
            overflow: "hidden",
            maxHeight: "100%",
            paddingTop: breakpoints.md ? 0 : 15,
            borderRadius: 25,
          },
        ]}
      >
        {!breakpoints.md && (
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
        )}
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
              alignItems: "center",
              justifyContent: "center",
              minHeight: height * 0.65,
              ...(Platform.OS === "web" && { flex: 1 }),
            }}
          >
            <Spinner />
          </View>
        )}
      </Pressable>
    </Pressable>
  );
});

export interface TaskDrawerProps {
  mutateList: any;
  children?: React.ReactNode;
  id: any;
  disabled?: boolean;
  isReadOnly?: boolean;
  dateRange?: string;
}

export const TaskDrawer = forwardRef(function TaskDrawer(
  {
    mutateList,
    children,
    id,
    disabled,
    isReadOnly,
    dateRange,
  }: TaskDrawerProps,
  ref
) {
  const { width } = useWindowDimensions();
  const contentRef = useRef(null);

  const sheetRef = useRef(null);

  // callbacks
  const handleOpen = useCallback(() => sheetRef.current.present(), []);
  const breakpoints = useResponsiveBreakpoints();

  useImperativeHandle(ref, () => ({
    show: handleOpen,
  }));

  const handleClose = useCallback(() => {
    contentRef.current?.triggerMutate();
    setTimeout(() => {
      sheetRef.current?.forceClose(
        breakpoints.md ? undefined : { overshootClamping: true, stiffness: 400 }
      );
    }, 0);
  }, [sheetRef, breakpoints]);

  const trigger = cloneElement((children || <Pressable />) as any, {
    onPress: handleOpen,
  });

  if (disabled) return children;

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={sheetRef}
        animateOnMount={!breakpoints.md}
        snapPoints={["100%"]}
        onClose={handleClose}
        style={{ width: "100%" }}
        maxWidth={width}
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleComponent={() => null}
        maxBackdropOpacity={0.1}
        enableContentPanningGesture={!breakpoints.md}
        {...(breakpoints.md && {
          maxBackdropOpacity: 0.05,
          animationConfigs: {
            overshootClamping: true,
            duration: 0.0001,
          },
        })}
      >
        <TaskDrawerWrapper
          ref={contentRef}
          handleClose={handleClose}
          id={id}
          dateRange={dateRange}
          mutateList={mutateList}
          isReadOnly={isReadOnly}
        />
      </BottomSheet>
    </>
  );
});
