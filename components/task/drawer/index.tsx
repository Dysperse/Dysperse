import { useBadgingService } from "@/context/BadgingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ErrorAlert from "@/ui/Error";
import Modal from "@/ui/Modal";
import LinearSkeleton from "@/ui/Skeleton/linear";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { showErrorToast } from "@/utils/errorToast";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, usePathname } from "expo-router";
import React, {
  cloneElement,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import useSWR from "swr";
import { TaskDrawerContent } from "./content";
import { TaskDrawerContext } from "./context";

const SafeBlurView = (props) => {
  const isDark = useDarkMode();
  return Platform.OS === "android" ? (
    <React.Fragment {...props} />
  ) : (
    <BlurView
      // style={{ flex: 1 }}
      intensity={60}
      tint={
        Platform.OS === "ios"
          ? isDark
            ? "dark"
            : "light"
          : isDark
          ? "systemUltraThinMaterialDark"
          : "systemUltraThinMaterialLight"
      }
      {...props}
    />
  );
};

function TaskDrawerWrapper({
  id,
  handleClose,
  dateRange,
  mutateList,
  isReadOnly,
  ref,
}: {
  id: any;
  handleClose: any;
  dateRange?: string;
  mutateList: any;
  isReadOnly?: boolean;
  ref?: React.Ref<any>;
}) {
  const { sessionToken } = useUser();

  const pathname = usePathname();
  const { id: inviteLinkId } = useLocalSearchParams();

  // Fetch data
  const { data, mutate, error } = useSWR([
    "space/entity",
    { id, ...(pathname.includes("/c/") && { inviteLinkId }) },
  ]);

  useImperativeHandle(ref, () => ({
    triggerMutate: () => mutateList(data),
  }));

  const theme = useColorTheme();
  const { forceClose } = useBottomSheet();
  const badgingService = useBadgingService();
  const isDark = useDarkMode();
  const breakpoints = useResponsiveBreakpoints();

  const updateTask = useCallback(
    async (payload, sendRequest = true) => {
      const oldData = data;
      const newData = {
        ...data,
        ...payload,
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
            ...payload,
          }),
        }
      ).catch(() => {
        badgingService.current.mutate();
        mutate(oldData, false);
        showErrorToast();
      });
    },
    [data, mutate, id, sessionToken, badgingService]
  );

  return (
    <Pressable
      onPress={(e) => e.stopPropagation()}
      style={[
        {
          flex: Platform.OS === "web" ? 1 : undefined,
          backgroundColor: addHslAlpha(
            theme[2],
            Platform.OS === "android" ? 1 : 0.5
          ),
          marginTop: "auto",
        },
      ]}
    >
      <SafeBlurView>
        {!breakpoints.md && (
          <BlurView
            style={{
              width: 40,
              height: 7,
              marginBottom: -7 - 15,
              backgroundColor: addHslAlpha(theme[11], 0.1),
              overflow: "hidden",
              zIndex: 99,
              alignSelf: "center",
              marginTop: 15,
              borderRadius: 99,
            }}
            tint={isDark ? "dark" : "light"}
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
              padding: 20,
              ...(Platform.OS === "web" && { flex: 1 }),
            }}
          >
            <View style={{ paddingBottom: 20, paddingHorizontal: 5 }}>
              <View style={{ gap: 10 }}>
                <LinearSkeleton width={"70%"} height={50} />
                <LinearSkeleton width={"30%"} height={20} />
                <LinearSkeleton width={"40%"} height={20} />
                <LinearSkeleton width={"20%"} height={20} />
                <LinearSkeleton width={"10%"} height={20} />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 5 }}>
              {[...new Array(4)].map((_, i) => (
                <LinearSkeleton
                  style={{ flex: 1, borderRadius: 99 }}
                  containerStyle={{ flex: 1 }}
                  height={50}
                  key={i}
                />
              ))}
            </View>
          </View>
        )}
      </SafeBlurView>
    </Pressable>
  );
}

export interface TaskDrawerProps {
  mutateList: any;
  children?: React.ReactNode;
  id: any;
  disabled?: boolean;
  isReadOnly?: boolean;
  dateRange?: string;
  onDoublePress?: () => void;
  smallWidth?: boolean;
  ref?: React.Ref<{
    show: () => void;
  }>;
}

export function TaskDrawer({
  mutateList,
  children,
  id,
  disabled,
  isReadOnly,
  dateRange,
  onDoublePress,
  smallWidth,
  ref,
}: TaskDrawerProps) {
  const contentRef = useRef(null);
  const sheetRef = useRef(null);
  const { height } = useWindowDimensions();

  // callbacks
  const handleOpen = useCallback(() => {
    sheetRef.current.present();
    Keyboard.dismiss();
  }, []);
  const breakpoints = useResponsiveBreakpoints();

  useImperativeHandle(ref, () => ({
    show: handleOpen,
  }));

  const handleClose = useCallback(() => {
    if (isReadOnly) return;
    contentRef.current?.triggerMutate();
  }, [isReadOnly]);

  const tappedRef = useRef(0);

  const handleRefTap = () => {
    tappedRef.current++;
    setTimeout(() => {
      if (tappedRef.current == 2) onDoublePress();
      else if (tappedRef.current == 1) handleOpen();
      tappedRef.current = 0;
    }, 250);
  };

  const trigger = cloneElement((children || <Pressable />) as any, {
    onPress: typeof onDoublePress === "function" ? handleRefTap : handleOpen,
  });

  if (disabled) return children;

  return (
    <>
      {trigger}
      <Modal
        animation={breakpoints.md ? "SCALE" : "BOTH"}
        sheetRef={sheetRef}
        maxWidth={smallWidth ? 400 : 590}
        height="auto"
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
        innerStyles={{
          backgroundColor:
            Platform.OS === "android" ? undefined : "transparent",
          borderRadius: 40,
        }}
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
}

