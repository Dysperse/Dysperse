import { useFocusPanelContext } from "@/components/focus-panel/context";
import { CreateLabelModal } from "@/components/labels/createModal";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import CreateTask from "@/components/task/create";
import { useSession } from "@/context/AuthProvider";
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
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  InteractionManager,
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
    paddingTop: 15,
    paddingRight: 25,
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
    InteractionManager.runAfterInteractions(() => {
      if (!breakpoints.md) sidebarRef.current.closeDrawer();
    });
  }, [sidebarRef, breakpoints]);

  const theme = useColorTheme();
  useHotkeys("ctrl+0", () => router.replace("/"));

  return (
    <IconButton
      onPress={handleHome}
      style={{ borderRadius: 10 }}
      backgroundColors={{
        default: theme[isHome ? 4 : 3],
        pressed: theme[5],
        hovered: theme[4],
      }}
      size={45}
    >
      <Icon filled={isHome}>home</Icon>
    </IconButton>
  );
});

const SyncButton = memo(function SyncButton({ syncRef }: any) {
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
      if (diff > 1000 * 60 * 30 || !lastSynced) {
        handleSync();
      }
    }
  }, [handleSync]);

  useImperativeHandle(syncRef, () => ({
    sync: handleSync,
  }));

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
      {/* <MenuItem
        onPress={handleSync}
        disabled={isLoading}
        style={isLoading && { opacity: 0.6 }}
      >
        <Icon>sync</Icon>
        <Text variant="menuItem">Sync now</Text>
      </MenuItem> */}
    </>
  );
});

export const LogoButton = memo(function LogoButton({
  toggleHidden,
}: {
  toggleHidden: any;
}) {
  const theme = useColorTheme();
  const menuRef = useRef(null);
  const { session, sessionToken } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const { panelState, setPanelState } = useFocusPanelContext();
  const { sidebarRef, desktopCollapsed } = useSidebarContext();

  const openSupport = useCallback(() => {
    Linking.openURL("https://blog.dysperse.com");
  }, []);
  const openFeedback = useCallback(() => {
    Linking.openURL("https://tally.so/r/wLdz5O?email=" + session?.user?.email);
  }, [session]);
  const openBug = useCallback(() => {
    Linking.openURL("https://tally.so/r/mVZjvE?email=" + session?.user?.email);
  }, [session]);

  const toggleFocus = () =>
    setPanelState((t) => (t === "CLOSED" ? "OPEN" : "CLOSED"));

  useEffect(() => {
    sendApiRequest(sessionToken, "POST", "space/integrations/sync", {});
  }, [sessionToken]);

  const syncRef = useRef(null);
  const [isLoading, setLoading] = useState(false);

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
      <SyncButton syncRef={syncRef} />
      <MenuPopover
        menuProps={{
          rendererProps: {
            placement: "bottom",
            anchorStyle: { opacity: 0 },
          },
        }}
        menuRef={menuRef}
        containerStyle={{ width: 190, marginLeft: 10, marginTop: 5 }}
        trigger={
          <View style={{ borderRadius: 20, overflow: "hidden" }}>
            <Pressable
              onPress={() => menuRef.current.open()}
              android_ripple={{ color: theme[4] }}
              style={({ pressed, hovered }) => [
                {
                  backgroundColor: theme[pressed ? 4 : hovered ? 3 : 2],
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 3,
                  paddingVertical: 10,
                },
                Platform.OS === "web" && { WebkitAppRegion: "no-drag" },
              ]}
            >
              <Logo size={40} />
              <Icon style={{ color: theme[11] }}>expand_more</Icon>
            </Pressable>
          </View>
        }
        options={[
          session?.space?.space?._count?.integrations > 0 && {
            icon: "sync",
            text: "Sync now",
            disabled: isLoading,
            callback: async () => {
              setLoading(true);
              await syncRef.current.sync();
              setLoading(false);
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
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginRight: -10,
          gap: 0.5,
        }}
      >
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
                selected: panelState !== "CLOSED",
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
            onPress={() => router.push("/focus")}
          />
        )}
      </View>
    </View>
  );
});

const QuickCreateButton = memo(function QuickCreateButton() {
  const theme = useColorTheme();
  const { mutate } = useSWRConfig();
  const itemRef = useRef<BottomSheetModal>(null);
  const labelRef = useRef<BottomSheetModal>(null);
  const breakpoints = useResponsiveBreakpoints();
  const { sidebarRef, desktopCollapsed } = useSidebarContext();

  useHotkeys(["ctrl+n", "shift+n"], (e) => {
    e.preventDefault();
    itemRef.current?.present();
  });

  useHotkeys(["ctrl+shift+n"], (e) => {
    e.preventDefault();
    router.push("/collections/create");
  });

  useHotkeys(["ctrl+shift+l"], (e) => {
    e.preventDefault();
    labelRef.current?.present();
  });

  const menuRef = useRef(null);

  return (
    <>
      <View style={{ display: "none" }}>
        <CreateTask
          mutate={() => mutate(() => true)}
          ref={itemRef}
          onPress={() => {
            menuRef.current.close();
          }}
        />
      </View>

      <MenuPopover
        menuRef={menuRef}
        closeOnSelect
        options={[
          {
            icon: "add_circle",
            text: "Task",
            callback: () => itemRef.current?.present(),
          },
          {
            renderer: () => (
              <CreateLabelModal
                sheetRef={labelRef}
                mutate={() => mutate(() => true)}
              >
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
            callback: () => {
              router.push("/collections/create");
              if (!breakpoints.md) sidebarRef.current.closeDrawer();
            },
          },
        ]}
        menuProps={{
          style: { flex: 1, marginRight: -10 },
          rendererProps: { containerStyle: { marginLeft: 10, width: 200 } },
        }}
        trigger={
          <IconButton
            style={{ borderRadius: 10, width: "100%" }}
            backgroundColors={{
              default: theme[3],
              pressed: theme[5],
              hovered: theme[4],
            }}
            size={45}
            pressableStyle={{ flexDirection: "row", gap: 10 }}
          >
            <Icon>note_stack_add</Icon>
            <Text style={{ color: theme[11] }}>New</Text>
          </IconButton>
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
        marginTop: 10,
        marginBottom: 10,
        gap: 10,
        ...(Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any)),
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

export const MiniLogo = ({ desktopSlide, onHoverIn }) => {
  const { fullscreen } = useGlobalSearchParams();
  const { desktopCollapsed, SIDEBAR_WIDTH } = useSidebarContext();
  const [titlebarHidden, setTitlebarHidden] = useState(
    navigator.windowControlsOverlay?.visible
  );

  useEffect(() => {
    const windowListener = document.addEventListener(
      "mouseleave",
      function (event) {
        if (
          desktopCollapsed &&
          (event.clientY <= 0 ||
            event.clientX <= 0 ||
            event.clientX >= window.innerWidth ||
            event.clientY >= window.innerHeight)
        ) {
          desktopSlide.value = -SIDEBAR_WIDTH;
        }
      }
    );
    const t = (navigator as any).windowControlsOverlay;
    const listener = t
      ? t.addEventListener("geometrychange", () => {
          setTitlebarHidden(t.visible);
        })
      : () => {};

    return () => {
      if (t) t.removeEventListener("geometrychange", listener);
      document.removeEventListener("mouseleave", windowListener);
    };
  }, []);

  return (
    Platform.OS === "web" &&
    titlebarHidden &&
    (desktopCollapsed || fullscreen) && (
      <Pressable
        onHoverIn={onHoverIn}
        onPress={onHoverIn}
        style={{
          flexDirection: "row",
          position: "absolute",
          top: 10,
          left: 10,
          alignItems: "center",
          gap: 5,
          zIndex: 1,
          ["marginLeft" as any]: "env(safe-area-inset-left, 10px)",
          ["webkitAppRegion" as any]: fullscreen ? undefined : "no-drag",
        }}
      >
        <Logo size={20} />
      </Pressable>
    )
  );
};

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

  const desktopSlide = useSharedValue(0);

  const transform = progressValue?.interpolate?.({
    inputRange: [0, 1],
    outputRange: [-(width / 10), 0],
  });

  const animatedStyles = [{ transform: [{ translateX: transform }] }];
  const desktopStyles = useAnimatedStyle(() => ({
    // boxShadow: "0 0 0 100vw rgba(0, 0, 0, 0.4)",
    transform: [
      {
        translateX: withSpring(desktopSlide.value, {
          stiffness: 200,
          damping: 40,
        }),
      },
    ],
  }));

  const toggleHidden = useCallback(() => {
    setDesktopCollapsed(!desktopCollapsed);
    if (Platform.OS === "web") {
      localStorage.setItem("desktopCollapsed", (!desktopCollapsed).toString());
    }
  }, [desktopCollapsed, setDesktopCollapsed]);

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

  useEffect(() => {
    desktopSlide.value = desktopCollapsed ? -SIDEBAR_WIDTH : 0;
  }, [desktopCollapsed, desktopSlide, SIDEBAR_WIDTH]);

  const SafeView = breakpoints.md
    ? (p) => <React.Fragment {...p} />
    : (p) => <View style={{ flex: 1 }} {...p} />;

  return (
    <>
      {desktopCollapsed && (
        <Pressable
          style={[
            Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
            {
              position: "absolute",
              top: 0,
              left: 0,
              height,
              width: 10,
              zIndex: 9999,
            },
          ]}
          onHoverIn={() => (desktopSlide.value = 0)}
        />
      )}
      <SafeView>
        {Platform.OS === "web" && (
          <MiniLogo
            desktopSlide={desktopSlide}
            onHoverIn={() => (desktopSlide.value = 0)}
          />
        )}
        <Animated.View
          {...(Platform.OS === "web" && {
            onMouseEnter: () => (desktopSlide.value = 1),
            onMouseLeave: () =>
              (desktopSlide.value = desktopCollapsed ? -SIDEBAR_WIDTH : 0),
          })}
          style={[
            { flex: breakpoints.md ? undefined : 1 },
            desktopCollapsed && desktopStyles,
            {
              zIndex: breakpoints.md ? 1 : 0,
              flexDirection: "row",
              backgroundColor: theme[2],
            },
            pathname.includes("chrome-extension") && { display: "none" },
            pathname.includes("settings") &&
              breakpoints.md && {
                zIndex: -999,
              },
          ]}
        >
          <NativeAnimated.View
            style={[
              animatedStyles,
              {
                width: SIDEBAR_WIDTH,
                flexDirection: "column",
                borderRightWidth: 2,
                borderRightColor: "transparent",
                backgroundColor: theme[2],
                ...(Platform.OS === "web" &&
                  !desktopCollapsed &&
                  ({
                    paddingTop: "env(titlebar-area-height,0)",
                  } as any)),
              },
              desktopCollapsed &&
                breakpoints.md && {
                  position: "absolute",
                  borderRadius: 25,
                  left: -100,
                  width: SIDEBAR_WIDTH + 100,
                  paddingLeft: 100,
                  zIndex: 99,
                  shadowOpacity: 0.4,
                  height: height - 50,
                  marginTop: 25,

                  borderWidth: 2,
                  borderColor: theme[5],
                  borderRightWidth: 2,
                  borderRightColor: theme[5],
                },
            ]}
          >
            <View style={[styles.header, { marginTop: insets.top }]}>
              <LogoButton toggleHidden={toggleHidden} />
              <Header />
            </View>
            <OpenTabsList />
          </NativeAnimated.View>
        </Animated.View>
      </SafeView>
    </>
  );
};

export default memo(Sidebar);

