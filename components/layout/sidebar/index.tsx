import { useCommandPaletteContext } from "@/components/command-palette/context";
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
import { Button } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import useSWR, { useSWRConfig } from "swr";
import SortableList from "../tabs/list";

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
    router.replace("/home");
    InteractionManager.runAfterInteractions(() => {
      if (!breakpoints.md) sidebarRef.current.closeDrawer();
    });
  }, [sidebarRef, breakpoints]);

  const theme = useColorTheme();
  useHotkeys("ctrl+0", () => router.replace("/home"));

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

  const openSupport = useCallback((e) => {
    e?.preventDefault();
    Linking.openURL("https://blog.dysperse.com");
  }, []);
  const openFeedback = useCallback(() => {
    Linking.openURL("https://tally.so/r/wLdz5O?email=" + session?.user?.email);
  }, [session]);
  const openBug = useCallback(() => {
    Linking.openURL("https://tally.so/r/mVZjvE?email=" + session?.user?.email);
  }, [session]);

  useEffect(() => {
    sendApiRequest(sessionToken, "POST", "space/integrations/sync", {});
  }, [sessionToken]);

  useHotkeys("F1", openSupport);

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
        containerStyle={{ width: 190, marginLeft: 10, marginTop: -5 }}
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
                renderer: () => (
                  <Text
                    style={{ padding: 10, paddingBottom: 0 }}
                    variant="eyebrow"
                  >
                    FOCUS PANEL
                  </Text>
                ),
              },

              {
                icon:
                  panelState === "OPEN"
                    ? "radio_button_checked"
                    : "radio_button_unchecked",
                text: "Full",
                callback: () => setPanelState("OPEN"),
              },
              {
                icon:
                  panelState === "COLLAPSED"
                    ? "radio_button_checked"
                    : "radio_button_unchecked",
                text: "Collapsed",
                callback: () => setPanelState("COLLAPSED"),
              },
              {
                icon:
                  panelState === "CLOSED"
                    ? "radio_button_checked"
                    : "radio_button_unchecked",
                text: "Closed",
                callback: () => setPanelState("CLOSED"),
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
  const { sidebarRef } = useSidebarContext();

  const [defaultValues, setDefaultValues] = useState<any>({});
  const { id } = useGlobalSearchParams();
  const pathname = usePathname();
  useHotkeys(["ctrl+n", "shift+n", "space"], (e) => {
    e.preventDefault();
    itemRef.current?.present();
  });

  useEffect(() => {
    if (pathname.includes("/collections/") && id !== "all") {
      setDefaultValues({ collectionId: id });
    }
  }, [id, pathname]);

  useEffect(() => {
    if (
      pathname !== "/" &&
      !pathname.includes("/reorder") &&
      !pathname.includes("/chrome-extension") &&
      !pathname.includes("/settings")
    )
      AsyncStorage.setItem("lastViewedRoute", pathname);
  }, [pathname]);

  useHotkeys(["ctrl+shift+n"], (e) => {
    e.preventDefault();
    router.push("/collections/create");
  });

  useHotkeys(["ctrl+shift+l"], (e) => {
    e.preventDefault();
    labelRef.current?.present();
  });

  const menuRef = useRef(null);
  const { isReached } = useStorageContext();

  return (
    <>
      <View style={{ display: "none" }}>
        <CreateTask
          mutate={() => mutate(() => true)}
          ref={itemRef}
          defaultValues={defaultValues}
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
            disabled={isReached}
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
  const isHome = usePathname() === "/home";

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

const JumpToButton = memo(function JumpToButton() {
  const theme = useColorTheme();
  const { sidebarRef } = useSidebarContext();
  const breakpoints = useResponsiveBreakpoints();
  const { handleOpen } = useCommandPaletteContext();

  const onOpen = () => {
    if (!breakpoints.md) sidebarRef.current?.closeDrawer();
    InteractionManager.runAfterInteractions(handleOpen);
  };

  useHotkeys(["ctrl+k", "ctrl+o", "ctrl+t", "ctrl+p"], (e) => {
    e.preventDefault();
    onOpen();
  });

  useHotkeys(["ctrl+/"], (e) => {
    e.preventDefault();
    router.push("/settings/shortcuts");
  });

  return (
    <View style={{ borderRadius: 15, overflow: "hidden", flex: 1 }}>
      <Button
        backgroundColors={{
          default: theme[2],
          hovered: theme[4],
          pressed: theme[5],
        }}
        height={50}
        onPress={onOpen as any}
        style={{
          justifyContent: "flex-start",
          ...(Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any)),
        }}
        android_ripple={{ color: theme[7] }}
        icon="add"
        bold
        text="New tab"
      />
    </View>
  );
});

function TabContainer() {
  const { data, error, mutate } = useSWR(["user/tabs"]);
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const { tab: currentTab } = useGlobalSearchParams();
  const { sessionToken } = useUser();
  const path = usePathname();

  const handleCloseTab = useCallback(
    (id: string) => async () => {
      try {
        if (!data) {
          return Toast.show({
            type: "error",
            text1: "Couldn't load tabs. Please try again later.",
          });
        }
        const tab = data.findIndex((tab: any) => tab.id === id);
        const lastTab = data[tab - 1] || data[tab + 1];
        if (lastTab) {
          setTimeout(() => {
            router.replace({
              params: {
                tab: lastTab.id,
                ...(typeof lastTab.params === "object" && lastTab.params),
              },
              pathname: lastTab.slug,
            });
          }, 0);
        } else {
          setTimeout(() => {
            router.replace("/home");
          }, 0);
        }
        mutate((oldData) => oldData.filter((oldTab: any) => oldTab.id !== id), {
          revalidate: false,
        });
        sendApiRequest(sessionToken, "DELETE", "user/tabs", { id });
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later.",
        });
        console.log(err);
      }
    },
    [mutate, data, sessionToken]
  );

  useHotkeys(["ctrl+shift+w", "ctrl+w"], (e) => {
    e.preventDefault();
    if (data) {
      const i = data.findIndex((i) => i.id === currentTab);
      let d = i - 1;
      if (i === 0) d = data.length - 1;
      handleCloseTab(data[d].id)();
    }
  });

  const handleSnapToIndex = (index: number) => {
    if (error)
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    if (!data) return;
    const _tab = data[index];
    if (currentTab === _tab.id) return;
    router.replace({
      pathname: _tab.slug,
      params: {
        tab: _tab.id,
        ...(typeof _tab.params === "object" && _tab.params),
      },
    });
  };
  useHotkeys(["ctrl+tab", "alt+ArrowDown"], (e) => {
    e.preventDefault();
    const i = data.findIndex((i) => i.id === currentTab);
    let d = i + 1;
    if (d >= data.length || i === -1) d = 0;
    handleSnapToIndex(d);
  });

  useHotkeys(["ctrl+shift+tab", "alt+ArrowUp"], (e) => {
    e.preventDefault();
    const i = data.findIndex((i) => i.id === currentTab);
    let d = i - 1;
    if (i === 0) d = data.length - 1;
    handleSnapToIndex(d);
  });

  useHotkeys(
    Array(9)
      .fill(0)
      .map((_, index) => "ctrl+" + (index + 1)),
    (keyboardEvent, hotKeysEvent) => {
      keyboardEvent.preventDefault();
      const i = hotKeysEvent.keys[0];
      if (i == "9") return handleSnapToIndex(data.length - 1);
      if (data[parseInt(i) - 1]) handleSnapToIndex(parseInt(i) - 1);
    }
  );

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 15,
        width: "100%",
        marginBottom: insets.bottom + 10,
        height: "100%",
      }}
    >
      {data && data.length > 0 ? (
        <SortableList
          sendServerRequest={(t) => {
            sendApiRequest(
              sessionToken,
              "PUT",
              "user/tabs",
              {},
              {
                body: JSON.stringify(t),
              }
            );
          }}
          handleCloseTab={handleCloseTab}
          mutate={mutate}
          theme={theme}
          currentTab={currentTab}
          breakpoints={breakpoints}
          data={data}
        />
      ) : (
        <View
          style={{
            justifyContent: "center",
            flex: 1,
            width: "100%",
          }}
        >
          {error ? (
            <ErrorAlert />
          ) : data && data.length === 0 ? (
            <>
              <View
                style={{
                  alignItems: "center",
                  padding: 20,
                  justifyContent: "center",
                  marginBottom: 10,
                  flex: 1,
                }}
              >
                <Text
                  variant="eyebrow"
                  style={{ marginTop: 10, fontSize: 13.5 }}
                >
                  It's quiet here...
                </Text>
                <Text
                  style={{
                    color: theme[11],
                    opacity: 0.5,
                    textAlign: "center",
                    fontSize: 13,
                    marginTop: 5,
                  }}
                >
                  Try opening a view or one of your collections
                </Text>
              </View>
            </>
          ) : (
            <Spinner style={{ marginHorizontal: "auto" }} />
          )}
        </View>
      )}

      <View style={{ marginBottom: 5, flexDirection: "row" }}>
        <JumpToButton />
        <IconButton
          size={50}
          style={{
            ...(Platform.OS === "web" &&
              ({ WebkitAppRegion: "no-drag" } as any)),
          }}
          onPress={() => router.push("/everything")}
          variant={path === "/everything" ? "filled" : undefined}
        >
          <Icon bold>home_storage</Icon>
        </IconButton>
      </View>
    </View>
  );
}
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
                marginRight: -8,
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
            {/* <OpenTabsList /> */}
            <TabContainer />
          </NativeAnimated.View>
        </Animated.View>
      </SafeView>
    </>
  );
};

export default memo(Sidebar);

