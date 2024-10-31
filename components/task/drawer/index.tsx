import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ErrorAlert from "@/ui/Error";
import Modal from "@/ui/Modal";
import Spinner from "@/ui/Spinner";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, usePathname } from "expo-router";
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

const SafeBlurView = (props) => {
  const isDark = useDarkMode();
  return Platform.OS === "android" ? (
    <React.Fragment {...props} />
  ) : (
    <BlurView
      style={{ flex: 1 }}
      intensity={50}
      tint={
        isDark ? "systemUltraThinMaterialDark" : "systemUltraThinMaterialLight"
      }
      {...props}
    />
  );
};

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

  const pathname = usePathname();
  const { id: inviteLinkId } = useLocalSearchParams();

  // Fetch data
  const { data, mutate, error } = useSWR([
    "space/entity",
    { id, ...(pathname.includes("/c/") && { inviteLinkId }) },
  ]);
  const insets = useSafeAreaInsets();

  const breakpoints = useResponsiveBreakpoints();

  useImperativeHandle(ref, () => ({
    triggerMutate: () => mutateList(data),
  }));

  const theme = useColorTheme();
  const { forceClose } = useBottomSheet();

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
      onPress={(e) => e.stopPropagation()}
      style={[
        {
          flex: 1,
          borderWidth: 1,
          borderColor: addHslAlpha(
            theme[6],
            Platform.OS === "android" ? 1 : 0.5
          ),
          backgroundColor: addHslAlpha(
            theme[2],
            Platform.OS === "android" ? 1 : 0.5
          ),
          marginTop: "auto",
          overflow: "hidden",
          maxHeight: "100%",
          borderRadius: 25,
        },
      ]}
    >
      <SafeBlurView>
        {!breakpoints.md && (
          <View style={{ backgroundColor: theme[2] }}>
            <View
              style={{
                width: 25,
                height: 5,
                marginTop: 15,
                backgroundColor: theme[5],
                borderRadius: 999,
                marginHorizontal: "auto",
                marginBottom: 10,
              }}
            />
          </View>
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
            <TaskDrawerContent
              forceClose={forceClose}
              handleClose={handleClose}
            />
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
            {error ? <ErrorAlert /> : <Spinner />}
          </View>
        )}
      </SafeBlurView>
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
  const { height } = useWindowDimensions();
  const contentRef = useRef(null);
  const sheetRef = useRef(null);

  // callbacks
  const handleOpen = useCallback(() => sheetRef.current.present(), []);
  const breakpoints = useResponsiveBreakpoints();

  useImperativeHandle(ref, () => ({
    show: handleOpen,
  }));

  const handleClose = useCallback(() => {
    if (isReadOnly) return;
    contentRef.current?.triggerMutate();
  }, [isReadOnly]);

  const trigger = cloneElement((children || <Pressable />) as any, {
    onPress: handleOpen,
  });

  if (disabled) return children;

  return (
    <>
      {trigger}
      <Modal
        animation="BOTH"
        sheetRef={sheetRef}
        maxWidth={500}
        height={Math.min(700, height - 100)}
        onClose={handleClose}
        transformCenter
        closeContainerStyles={!breakpoints.md && { justifyContent: "flex-end" }}
        containerStyle={
          breakpoints.md && {
            shadowRadius: 50,
            shadowOffset: {
              width: 20,
              height: 20,
            },
            shadowColor: "rgba(0,0,0,0.12)",
          }
        }
        maxBackdropOpacity={breakpoints.md ? 0.05 : 0.1}
      >
        <TaskDrawerWrapper
          ref={contentRef}
          handleClose={handleClose}
          id={id}
          dateRange={dateRange}
          mutateList={mutateList}
          isReadOnly={isReadOnly}
        />
      </Modal>
    </>
  );
});
