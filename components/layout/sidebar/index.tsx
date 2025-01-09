import { CreateCollectionModal } from "@/components/collections/create";
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
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
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
  const checkOpacity = useSharedValue(0);

  const { mutate } = useSWRConfig();
  const handleSync = useCallback(async () => {
    setIsLoading(true);
    try {
      await sendApiRequest(session, "POST", "space/integrations/sync", {});
      await mutate(() => true);
      if (Platform.OS === "web") {
        localStorage.setItem("lastSyncedTimestamp", Date.now().toString());
      }
      checkOpacity.value = 1;
      setTimeout(() => {
        checkOpacity.value = 0;
      }, 3000);
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [session, mutate, checkOpacity]);

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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(checkOpacity.value),
    transform: [{ scale: withSpring(checkOpacity.value) }],
  }));

  return (
    <>
      {isLoading && (
        <View
          style={{
            position: "absolute",
            bottom: 6,
            width: 20,
            pointerEvents: "none",
            height: 20,
            right: 25,
            borderRadius: 99,
            backgroundColor: theme[3],
            zIndex: 1,
            gap: 3,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner size={12} />
        </View>
      )}
      <Animated.View
        style={[
          animatedStyle,
          {
            position: "absolute",
            bottom: 6,
            width: 20,
            pointerEvents: "none",
            height: 20,
            right: 25,
            borderRadius: 99,
            backgroundColor: theme[6],
            zIndex: 1,
            gap: 3,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Icon size={15} bold style={{ marginTop: -2, color: theme[11] }}>
          cloud_done
        </Icon>
      </Animated.View>
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
              <SyncButton syncRef={syncRef} />
              <Icon style={{ color: theme[11] }}>expand_more</Icon>
            </Pressable>
          </View>
        }
        options={[
          session?.space?.space?._count?.integrations > 0 && {
            icon: "sync",
            text: isLoading ? "Syncing..." : "Sync now",
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
                icon: "psychiatry",
                text: "Focus panel",
                callback: () =>
                  setPanelState((t) =>
                    t === "COLLAPSED" ? "CLOSED" : "COLLAPSED"
                  ),
                selected: panelState !== "CLOSED",
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
  const { mutate } = useSWRConfig();
  const { session } = useUser();
  const theme = useColorTheme();
  const itemRef = useRef<BottomSheetModal>(null);
  const labelRef = useRef<BottomSheetModal>(null);

  const [defaultValues, setDefaultValues] = useState<any>({});
  const { id, fullscreen } = useGlobalSearchParams();
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
      !pathname.includes("/everything") &&
      !pathname.includes("/chrome-extension") &&
      !pathname.includes("/settings") &&
      !fullscreen
    )
      AsyncStorage.setItem("lastViewedRoute", pathname);
  }, [pathname, fullscreen]);

  useHotkeys(["ctrl+shift+n"], (e) => {
    e.preventDefault();
    createCollectionRef.current.present();
  });

  useHotkeys(["ctrl+shift+l"], (e) => {
    e.preventDefault();
    labelRef.current?.present();
  });

  const menuRef = useRef(null);
  const createCollectionRef = useRef(null);
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
        <CreateCollectionModal ref={createCollectionRef} />
      </View>

      <MenuPopover
        menuRef={menuRef}
        closeOnSelect
        options={[
          {
            renderer: () => (
              <View style={{ flexDirection: "row" }}>
                <MenuItem
                  onPress={() => {
                    itemRef.current?.present();
                    menuRef.current.close();
                  }}
                  style={{ flex: 1 }}
                >
                  <Icon>add_circle</Icon>
                  <Text variant="menuItem">Task</Text>
                </MenuItem>
                {session.user.betaTester && (
                  <MenuItem
                    onPress={() => {
                      menuRef.current.close();
                      router.push("/upload");
                    }}
                  >
                    <Icon>upload</Icon>
                  </MenuItem>
                )}
              </View>
            ),
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
            text: "Collection",
            icon: "folder",
            callback: () => createCollectionRef.current.present(),
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
  const { session } = useUser();
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
    (navigator as any).windowControlsOverlay?.visible
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
          desktopSlide.value = -SIDEBAR_WIDTH.value;
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

function PrimarySidebar({ progressValue }) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();
  const { width, height } = useWindowDimensions();

  const {
    SIDEBAR_WIDTH,
    ORIGINAL_SIDEBAR_WIDTH,
    desktopCollapsed,
    setDesktopCollapsed,
  } = useSidebarContext();

  const breakpoints = useResponsiveBreakpoints();

  const transform = progressValue?.interpolate?.({
    inputRange: [0, 1],
    outputRange: [-(width / 10), 0],
  });

  const animatedStyles = [{ transform: [{ translateX: transform }] }];

  const toggleHidden = useCallback(() => {
    setDesktopCollapsed(!desktopCollapsed);
    if (Platform.OS === "web") {
      localStorage.setItem("desktopCollapsed", (!desktopCollapsed).toString());
    }
  }, [desktopCollapsed, setDesktopCollapsed]);

  useHotkeys("`", toggleHidden, {});

  return (
    <NativeAnimated.View
      style={[
        animatedStyles,
        {
          width: ORIGINAL_SIDEBAR_WIDTH + 10,
          flex: 1,
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
            width: SIDEBAR_WIDTH.value + 100,
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
  );
}

function SecondarySidebar() {
  const { SECONDARY_SIDEBAR_WIDTH, sidebarRef } = useSidebarContext();
  const theme = useColorTheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        width: SECONDARY_SIDEBAR_WIDTH,
        padding: 15,
        paddingRight: 0,
        paddingBottom: 15 + insets.bottom,
        backgroundColor: theme[2],
      }}
    >
      <View
        style={{ flex: 1, width: "100%", justifyContent: "center", gap: 5 }}
      >
        <Button
          bold
          height={100}
          text="Labels"
          containerStyle={[
            { borderRadius: 20 },
            Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
          ]}
          style={{ flexDirection: "column" }}
          icon="label"
          onPress={() => {
            router.push("/everything");
            sidebarRef.current.closeDrawer();
          }}
          variant={pathname === "/everything" ? "filled" : "text"}
        />
        <Button
          bold
          height={100}
          text="Collections"
          containerStyle={[
            { borderRadius: 20 },
            Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
          ]}
          style={{ flexDirection: "column" }}
          icon="stack"
          onPress={() => {
            router.push("/everything/collections");
            sidebarRef.current.closeDrawer();
          }}
          variant={pathname === "/everything/collections" ? "filled" : "text"}
        />
        <Button
          bold
          height={100}
          text="Trash"
          onPress={() => {
            router.push("/everything/trash");
            sidebarRef.current.closeDrawer();
          }}
          containerStyle={[
            { borderRadius: 20 },
            Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
          ]}
          style={{ flexDirection: "column" }}
          icon="delete"
          variant={pathname === "/everything/trash" ? "filled" : "text"}
        />
      </View>
      <IconButton
        icon="west"
        onPress={() => {
          router.replace("/");
          InteractionManager.runAfterInteractions(() => {
            sidebarRef.current.openDrawer();
          });
        }}
        style={[
          { marginLeft: 10 },
          Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
        ]}
      />
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
  const {
    SIDEBAR_WIDTH,
    ORIGINAL_SIDEBAR_WIDTH,
    SECONDARY_SIDEBAR_WIDTH,
    desktopCollapsed,
    setDesktopCollapsed,
  } = useSidebarContext();
  const theme = useColorTheme();
  const { height } = useWindowDimensions();

  const desktopSlide = useSharedValue(0);

  const desktopStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(desktopSlide.value, {
          stiffness: 200,
          damping: 40,
        }),
      },
    ],
  }));

  const primarySidebarStyles = useAnimatedStyle(() => ({
    pointerEvents:
      SIDEBAR_WIDTH.value === SECONDARY_SIDEBAR_WIDTH ? "none" : "auto",
    width: ORIGINAL_SIDEBAR_WIDTH,
    transform: [
      {
        translateX: withSpring(
          SIDEBAR_WIDTH.value === SECONDARY_SIDEBAR_WIDTH
            ? -ORIGINAL_SIDEBAR_WIDTH - 20
            : 0,
          {
            stiffness: 200,
            damping: 40,
          }
        ),
      },
    ],
  }));

  const secondarySidebarStyles = useAnimatedStyle(() => ({
    pointerEvents:
      SIDEBAR_WIDTH.value === SECONDARY_SIDEBAR_WIDTH ? "auto" : "none",
    marginLeft: -ORIGINAL_SIDEBAR_WIDTH - 3,
    transform: [
      {
        translateX: withSpring(
          SIDEBAR_WIDTH.value === ORIGINAL_SIDEBAR_WIDTH
            ? ORIGINAL_SIDEBAR_WIDTH - 3
            : 0,
          {
            stiffness: 200,
            damping: 40,
          }
        ),
      },
    ],
  }));
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
    desktopSlide.value = desktopCollapsed ? -SIDEBAR_WIDTH.value : 0;
  }, [desktopCollapsed, desktopSlide, SIDEBAR_WIDTH]);

  const SafeView = breakpoints.md
    ? (p) => <React.Fragment {...p} />
    : (p) => <View style={{ flex: 1 }} {...p} />;

  const widthStyle = useAnimatedStyle(() => ({
    width: withSpring(SIDEBAR_WIDTH.value, {
      stiffness: 200,
      damping: 40,
      overshootClamping: true,
    }),
  }));

  useEffect(() => {
    setTimeout(
      () => {
        if (pathname.includes("everything")) {
          SIDEBAR_WIDTH.value = SECONDARY_SIDEBAR_WIDTH;
        } else {
          SIDEBAR_WIDTH.value = ORIGINAL_SIDEBAR_WIDTH;
        }
      },
      Platform.OS === "web" ? 400 : 0
    );
  }, [pathname]);

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
              (desktopSlide.value = desktopCollapsed
                ? -SIDEBAR_WIDTH.value
                : 0),
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
          ]}
        >
          <Animated.View
            style={[
              widthStyle,
              {
                flexDirection: "row",
                maxWidth: ORIGINAL_SIDEBAR_WIDTH,
                overflow: "hidden",
              },
            ]}
          >
            <Animated.View style={primarySidebarStyles}>
              <PrimarySidebar progressValue={progressValue} />
            </Animated.View>
            <Animated.View
              style={[
                secondarySidebarStyles,
                { height: "100%", width: SECONDARY_SIDEBAR_WIDTH },
              ]}
            >
              <SecondarySidebar />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </SafeView>
    </>
  );
};

export default memo(Sidebar);
