import { useFocusPanelContext } from "@/components/focus-panel/context";
import { CreateLabelModal } from "@/components/labels/createModal";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import CreateTask from "@/components/task/create";
import { useSession } from "@/context/AuthProvider";
import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { router, usePathname } from "expo-router";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Linking,
  Animated as NativeAnimated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useSWRConfig } from "swr";
import OpenTabsList from "../tabs/carousel";

const styles = StyleSheet.create({
  header: {
    padding: 15,
    paddingBottom: 0,
    paddingTop: 25,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: 7,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

const HomeButton = memo(function HomeButton({ isHome }: { isHome: boolean }) {
  const { sidebarRef } = useSidebarContext();
  const breakpoints = useResponsiveBreakpoints();

  const handleHome = useCallback(() => {
    router.replace("/");
    if (!breakpoints.md) sidebarRef.current.closeDrawer();
  }, [sidebarRef, breakpoints]);

  const theme = useColorTheme();
  useHotkeys("ctrl+0", () => router.replace("/"));

  return (
    <Pressable
      onPress={handleHome}
      onMouseDown={handleHome}
      style={({ pressed, hovered }) => [
        styles.button,
        {
          borderWidth: 1,
          backgroundColor: theme[isHome ? 2 : pressed ? 4 : hovered ? 3 : 2],
          borderColor: theme[isHome ? 5 : pressed ? 7 : hovered ? 6 : 4],
        },
        Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
      ]}
    >
      <Icon filled={isHome}>home</Icon>
    </Pressable>
  );
});

const SyncButton = memo(function SyncButton() {
  const theme = useColorTheme();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const { width: windowWidth } = useWindowDimensions();

  const barWidth = useSharedValue(0);
  const opacity = useSharedValue(0);

  const width = useAnimatedStyle(() => ({
    width: barWidth.value,
    opacity: withSpring(opacity.value),
  }));
  const { mutate } = useSWRConfig();
  const handleSync = useCallback(async () => {
    setIsLoading(true);
    opacity.value = 1;
    barWidth.value = withSpring(windowWidth - 20, {
      stiffness: 50,
      damping: 9000,
      mass: 200,
    });
    try {
      await sendApiRequest(session, "POST", "space/integrations/sync", {});
      await mutate(() => true);
      Toast.show({ type: "success", text1: "Integrations are up to date!" });
      if (Platform.OS === "web") {
        localStorage.setItem("lastSyncedTimestamp", Date.now().toString());
      }
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      barWidth.value = withSpring(windowWidth, { overshootClamping: true });
      setTimeout(() => {
        opacity.value = 0;
      }, 500);
      setTimeout(() => {
        barWidth.value = 0;
      }, 1000);
      setIsLoading(false);
    }
  }, [barWidth, windowWidth, opacity, session, mutate]);

  useEffect(() => {
    if (Platform.OS === "web") {
      const lastSynced = localStorage.getItem("lastSyncedTimestamp");
      const diff = Date.now() - parseInt(lastSynced);
      if (diff > 1000 * 60 * 60 || !lastSynced) {
        handleSync();
      }
    }
  }, [handleSync]);

  return (
    <>
      <Portal>
        <Animated.View
          style={[
            width,
            {
              position: "absolute",
              top: 0,
              left: 0,
              height: 2,
              backgroundColor: theme[11],
              shadowColor: theme[11],
              shadowRadius: 10,
            },
          ]}
        />
      </Portal>
      <MenuItem
        onPress={handleSync}
        disabled={isLoading}
        style={isLoading && { opacity: 0.6 }}
      >
        <Icon>sync</Icon>
        <Text variant="menuItem">Sync now</Text>
      </MenuItem>
    </>
  );
});

export const LogoButton = memo(function LogoButton({
  toggleHidden,
}: {
  toggleHidden: any;
}) {
  const { session, sessionToken } = useUser();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const openSupport = useCallback(() => {
    Linking.openURL("https://blog.dysperse.com");
  }, []);
  const openFeedback = useCallback(() => {
    Linking.openURL("https://tally.so/r/wLdz5O?email=" + session.user.email);
  }, [session]);
  const openBug = useCallback(() => {
    Linking.openURL("https://tally.so/r/mVZjvE?email=" + session.user.email);
  }, [session.user.email]);

  const { isFocused, setFocus } = useFocusPanelContext();
  const { sidebarRef, desktopCollapsed } = useSidebarContext();

  useEffect(() => {
    sendApiRequest(sessionToken, "POST", "space/integrations/sync", {});
  }, [sessionToken]);

  const toggleFocus = () => setFocus(!isFocused);

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
      ]}
    >
      <MenuPopover
        menuProps={{
          rendererProps: {
            placement: "bottom",
            anchorStyle: { opacity: 0 },
          },
        }}
        containerStyle={{ width: 190, marginLeft: 10, marginTop: 5 }}
        trigger={
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: 3,
              },
              Platform.OS === "web" && { WebkitAppRegion: "no-drag" },
            ]}
          >
            <Logo size={40} />
            <Icon style={{ color: theme[11] }}>expand_more</Icon>
          </Pressable>
        }
        options={[
          session?.space?.space?._count?.integrations > 0 && {
            renderer: () => <SyncButton />,
          },
          {
            icon: "delete",
            text: "Trash",
            callback: () => {
              router.push("/trash");
              setTimeout(() => {
                if (!breakpoints.md) sidebarRef.current.closeDrawer();
              }, 300);
            },
          },
          {
            icon: "settings",
            text: "Settings",
            callback: () => {
              router.push("/settings");
              setTimeout(() => {
                if (!breakpoints.md) sidebarRef.current.closeDrawer();
              }, 300);
            },
          },
          // { divider: true, key: "1" },
          {
            icon: "question_mark",
            text: "Help",
            callback: openSupport,
          },
          {
            icon: "lightbulb",
            text: "Want a feature?",
            callback: openFeedback,
          },
          {
            icon: "heart_broken",
            text: "Report a bug",
            callback: openBug,
          },
        ]}
      />
      {breakpoints.md ? (
        <MenuPopover
          menuProps={{
            rendererProps: {
              placement: breakpoints.md ? "right" : "bottom",
              anchorStyle: { opacity: 0 },
            },
          }}
          containerStyle={{ marginTop: 10, width: 200 }}
          trigger={
            <IconButton
              size={40}
              icon="dock_to_right"
              style={{ opacity: 0.9 }}
            />
          }
          options={[
            {
              icon: "dock_to_right",
              text: "Sidebar",
              callback: toggleHidden,
              selected: !desktopCollapsed,
            },
            {
              icon: "dock_to_left",
              text: "Focus panel",
              selected: isFocused,
              callback: toggleFocus,
            },
          ]}
        />
      ) : (
        <IconButton
          size={40}
          icon="psychiatry"
          variant="outlined"
          style={{ opacity: 0.9 }}
          onPress={toggleFocus}
        />
      )}
    </View>
  );
});

const QuickCreateButton = memo(function QuickCreateButton() {
  const theme = useColorTheme();
  const { mutate } = useSWRConfig();
  const itemRef = useRef<BottomSheetModal>(null);

  useHotkeys(["ctrl+n", "shift+n"], (e) => {
    e.preventDefault();
    itemRef.current?.present();
  });

  return (
    <>
      <MenuPopover
        options={[
          {
            renderer: () => (
              <CreateTask mutate={() => mutate(() => true)} sheetRef={itemRef}>
                <MenuItem>
                  <Icon>add_circle</Icon>
                  <Text variant="menuItem">Item</Text>
                </MenuItem>
              </CreateTask>
            ),
          },
          {
            renderer: () => (
              <CreateLabelModal mutate={() => mutate(() => true)}>
                <MenuItem>
                  <Icon>label</Icon>
                  <Text variant="menuItem">Label</Text>
                </MenuItem>
              </CreateLabelModal>
            ),
          },
          {
            icon: "layers",
            text: "Collection",
            callback: () => router.push("/collections/create"),
          },
        ]}
        menuProps={{
          style: { flex: 1, marginRight: -10 },
          rendererProps: { containerStyle: { marginLeft: 10, width: 200 } },
        }}
        trigger={
          <Pressable
            style={({ pressed, hovered }) => [
              styles.button,
              {
                borderWidth: 1,
                borderColor: theme[pressed ? 7 : hovered ? 6 : 4],
                backgroundColor: theme[pressed ? 4 : hovered ? 3 : 2],
                flex: 1,
                minHeight: 45,
              },
              Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
            ]}
          >
            <Icon>note_stack_add</Icon>
            <Text style={{ color: theme[11] }}>New</Text>
          </Pressable>
        }
      />
    </>
  );
});

const Header = memo(function Header() {
  const isHome = usePathname() === "/";

  return (
    <View
      style={{
        marginTop: 20,
        marginBottom: 10,
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 10,
        }}
      >
        <HomeButton isHome={isHome} />
        <QuickCreateButton />
      </View>
    </View>
  );
});

const Sidebar = ({
  progressValue,
}: {
  progressValue?: NativeAnimated.Value;
}) => {
  const breakpoints = useResponsiveBreakpoints();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { SIDEBAR_WIDTH, desktopCollapsed, setDesktopCollapsed } =
    useSidebarContext();
  const theme = useColorTheme();
  const { width, height } = useWindowDimensions();

  const transform = progressValue?.interpolate?.({
    inputRange: [0, 1],
    outputRange: [-(width / 10), 0],
  });
  const animatedStyles = [
    {
      transform: [
        {
          translateX: transform,
        },
      ],
    },
  ];
  const { sidebarRef } = useSidebarContext();
  const toggleHidden = useCallback(() => {
    if (sidebarRef.current.state.drawerOpened) {
      sidebarRef.current.closeDrawer();
    } else {
      sidebarRef.current.openDrawer();
    }
  }, [sidebarRef]);

  useHotkeys("`", toggleHidden, {});
  useHotkeys("ctrl+comma", () => {
    if (pathname.includes("settings")) return;
    router.push("/settings");
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      if (localStorage.getItem("desktopCollapsed") === "true")
        setDesktopCollapsed(true);
    }
  }, [setDesktopCollapsed]);

  const { error } = useUser();
  const { error: storageError } = useStorageContext();

  return (
    <View
      style={[
        {
          zIndex: breakpoints.md ? 1 : 0,
          flexDirection: "row",
          backgroundColor: theme[2],
        },
        pathname.includes("settings") &&
          breakpoints.md && {
            maxWidth: 0,
            overflow: "hidden",
          },
      ]}
    >
      <NativeAnimated.View
        style={[
          animatedStyles,
          {
            height:
              height +
              (error || storageError ? -30 : insets.top + insets.bottom),
            width: SIDEBAR_WIDTH,
            flexDirection: "column",
            borderRightWidth: 2,
            borderRightColor: "transparent",
            backgroundColor: theme[2],
            ...(Platform.OS === "web" &&
              ({
                paddingTop: "env(titlebar-area-height,0)",
              } as any)),
          },
          desktopCollapsed &&
            breakpoints.md && {
              shadowColor: theme[1],
              shadowRadius: 50,
              borderRadius: 0,
              borderRightColor: theme[5],
              overflow: "hidden",
              borderColor: theme[5],
              width: SIDEBAR_WIDTH,
            },
        ]}
      >
        <View style={[styles.header, { marginTop: insets.top }]}>
          <LogoButton toggleHidden={toggleHidden} />
          <Header />
        </View>
        <OpenTabsList />
      </NativeAnimated.View>
    </View>
  );
};

export default memo(Sidebar);
