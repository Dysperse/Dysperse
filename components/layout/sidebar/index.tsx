import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useSession } from "@/context/AuthProvider";
import { OnboardingContainer } from "@/context/OnboardingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import {
  default as React,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Freeze } from "react-freeze";
import {
  InteractionManager,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AttachStep } from "react-native-spotlight-tour";
import Toast from "react-native-toast-message";
import useSWR, { useSWRConfig } from "swr";
import OpenTabsList from "../tabs/carousel";
import FocusPanel from "./focus-panel";

export const styles = StyleSheet.create({
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
  const { session } = useUser();
  const { sidebarRef, desktopCollapsed } = useSidebarContext();
  const breakpoints = useResponsiveBreakpoints();

  const hasCompleted = dayjs(session?.user?.profile?.lastPlanned).isToday();

  const handleHome = useCallback(() => {
    if (Platform.OS !== "web") impactAsync(ImpactFeedbackStyle.Light);
    if (router.canDismiss()) router.dismissAll();
    router.replace("/home");
    InteractionManager.runAfterInteractions(() => {
      if (!breakpoints.md || desktopCollapsed) sidebarRef.current.closeDrawer();
    });
  }, [sidebarRef, breakpoints]);

  useEffect(() => {
    if (breakpoints.md) sidebarRef.current?.openDrawer?.();
  }, [breakpoints.md]);

  const theme = useColorTheme();
  useHotkeys("ctrl+0", () => router.replace("/home"));

  return (
    <IconButton
      onPress={handleHome}
      style={{ borderRadius: 15, width: "100%" }}
      backgroundColors={{
        default: theme[isHome ? 4 : 3],
        pressed: theme[5],
        hovered: theme[4],
      }}
      size={45}
      pressableStyle={{ flexDirection: "row", gap: 5 }}
    >
      <Icon filled={isHome}>home</Icon>
      {!hasCompleted && (
        <View
          style={[
            {
              backgroundColor: theme[11],
              width: 7,
              height: 7,
              borderRadius: 99,
              marginLeft: -10,
              position: "absolute",
              top: 12,
              right: breakpoints.md ? 33 : 45,
            },
          ]}
        />
      )}
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
  const { session } = useUser();
  const breakpoints = useResponsiveBreakpoints();
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
          <AttachStep index={3}>
            <View style={{ borderRadius: 20, overflow: "hidden" }}>
              <Button
                onPress={() => menuRef.current.open()}
                android_ripple={{ color: theme[4] }}
                height={60}
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 3,
                    gap: 0,
                    paddingVertical: 10,
                  },
                  Platform.OS === "web" &&
                    ({ WebkitAppRegion: "no-drag" } as any),
                ]}
                containerStyle={{ borderRadius: 20 }}
                backgroundColors={{
                  default: theme[2],
                  pressed: theme[3],
                  hovered: theme[4],
                }}
              >
                <Logo size={40} />
                {session?.space?.space?._count?.integrations > 0 && (
                  <SyncButton syncRef={syncRef} />
                )}
                <Icon style={{ color: theme[11] }}>expand_more</Icon>
              </Button>
            </View>
          </AttachStep>
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
              menuRef.current.close();
              if (!breakpoints.md || desktopCollapsed)
                sidebarRef.current.closeDrawer();
              InteractionManager.runAfterInteractions(() => {
                router.push("/settings");
              });
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
        {breakpoints.md && (
          <IconButton
            size={40}
            icon="dock_to_left"
            style={{ opacity: 0.9 }}
            onPress={toggleHidden}
          />
        )}
      </View>
    </View>
  );
});

export const TimeZoneModal = () => {
  const { session, sessionToken, mutate } = useUser();

  const ref = useRef(null);

  const handleChangeDefault = async () => {
    await sendApiRequest(
      sessionToken,
      "PUT",
      "user/account",
      {},
      {
        body: JSON.stringify({
          timeZone: dayjs.tz.guess(),
        }),
      }
    );

    mutate((t) => ({ ...t, user: { ...t.user, timeZone: dayjs.tz.guess() } }), {
      revalidate: false,
    });
  };

  const hours =
    dayjs.tz(dayjs(), session?.user?.timeZone).get("hour") -
    dayjs().get("hour");

  return (
    <>
      <Button
        variant="outlined"
        containerStyle={{ marginRight: -10, borderRadius: 10 }}
        onPress={() => ref.current.present()}
        icon="travel"
        height={45}
        text={
          hours === 0
            ? "Travel mode"
            : `${hours} hour${Math.abs(hours) !== 1 ? "s" : ""} ${
                hours < 0 ? "ahead" : "behind"
              }`
        }
        bold
        textProps={{ weight: 700 }}
      />
      <Modal animation="SCALE" sheetRef={ref} maxWidth={380}>
        <View style={{ padding: 20, alignItems: "center" }}>
          <Emoji emoji="1F9ED" size={50} style={{ marginVertical: 10 }} />
          <Text
            style={{
              textAlign: "center",
              fontSize: 40,
              fontFamily: "serifText800",
              marginVertical: 10,
            }}
          >
            Hey there,{"\n"} time traveller.
          </Text>
          <Text
            style={{
              textAlign: "center",
              opacity: 0.6,
              fontSize: 20,
              marginBottom: 10,
            }}
            weight={300}
          >
            Times shown in app will reflect{"\n"}your current time zone.
          </Text>

          <Button
            variant="filled"
            style={{ paddingHorizontal: 30 }}
            onPress={() => {
              handleChangeDefault();
              if (process.env.NODE_ENV === "development")
                return alert(dayjs.tz().format("dddd, MMMM D, YYYY h:mm A"));
              Toast.show({ type: "info", text1: "Coming soon!" });
            }}
            text={`Make ${dayjs.tz.guess()} my default`}
          />
          <Text style={{ marginTop: 5, opacity: 0.6, fontSize: 12 }}>
            Your home time zone is {session?.user?.timeZone}
          </Text>
        </View>
      </Modal>
    </>
  );
};

export const Header = memo(function Header() {
  const { session } = useUser();
  const theme = useColorTheme();
  const isHome = usePathname() === "/home";

  const isTimeZoneDifference = session?.user?.timeZone !== dayjs.tz.guess();

  const { data: sharedWithMe } = useSWR(["user/collectionAccess"]);
  const hasUnread =
    Array.isArray(sharedWithMe) && sharedWithMe?.filter((c) => !c.hasSeen);

  return (
    <View
      style={{
        marginTop: 10,
        marginBottom: 10,
        gap: 10,
        ...(Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any)),
      }}
    >
      {isTimeZoneDifference && <TimeZoneModal />}
      <View
        style={{
          flexDirection: "row",
          gap: 5,
        }}
      >
        <AttachStep index={0}>
          <View style={{ flex: 1 }}>
            <HomeButton isHome={isHome} />
          </View>
        </AttachStep>
        <AttachStep index={1}>
          <View style={{ flex: 1, marginRight: -10 }}>
            <IconButton
              style={{ borderRadius: 15, width: "100%" }}
              variant="filled"
              size={45}
              onPress={() => {
                impactAsync(ImpactFeedbackStyle.Light);
                router.replace("/everything");
              }}
            >
              <Icon>home_storage</Icon>
              {Array.isArray(hasUnread) && hasUnread?.length > 0 && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    backgroundColor: theme[9],

                    position: "absolute",
                    top: 5,
                    right: 5,
                  }}
                />
              )}
            </IconButton>
          </View>
        </AttachStep>
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

const PrimarySidebar = memo(function PrimarySidebar({ progressValue }: any) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();

  const {
    ORIGINAL_SIDEBAR_WIDTH,
    desktopCollapsed,
    sidebarRef,
    setDesktopCollapsed,
  } = useSidebarContext();

  const breakpoints = useResponsiveBreakpoints();

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progressValue.value, [0, 1], [0.8, 1]),
  }));

  const transformStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(progressValue.value, [0, 1], [0.9, 1]),
      },
    ],
  }));

  const toggleHidden = useCallback(
    (e) => {
      e.preventDefault();
      if (breakpoints.md) {
        setDesktopCollapsed(!desktopCollapsed);
        InteractionManager.runAfterInteractions(() => {
          sidebarRef.current[desktopCollapsed ? "openDrawer" : "closeDrawer"]();
        });
        AsyncStorage.setItem(
          "desktopCollapsed",
          (!desktopCollapsed).toString()
        );
      } else {
        sidebarRef.current.closeDrawer();
      }
    },
    [desktopCollapsed, setDesktopCollapsed, sidebarRef, breakpoints]
  );

  useHotkeys("`", toggleHidden, {});
  const pathname = usePathname();

  return (
    <OnboardingContainer
      id="SIDEBAR"
      onlyIf={() => pathname === "/home"}
      onStart={() => sidebarRef.current.openDrawer()}
      steps={[
        {
          text: "Pin widgets, plan your day, and get insights from the home page.",
        },
        {
          text: "Here, you can find all your labels, collections, and deleted items.",
        },
        {
          floatingProps: { placement: breakpoints.md ? "right" : "top" },
          text: "Open tabs to view your collections",
        },
        {
          text: "You can open settings to explore themes, shortcuts, and more.",
        },
      ]}
    >
      {() => (
        <Animated.View
          style={[
            opacityStyle,
            transformStyle,
            {
              width: ORIGINAL_SIDEBAR_WIDTH + 10,
              flex: 1,
              flexDirection: "column",
              borderRightWidth: breakpoints.md ? 2 : 5,
              borderRightColor: "transparent",
              backgroundColor: theme[2],
              ...(Platform.OS === "web" &&
                !desktopCollapsed &&
                ({
                  paddingTop: "env(titlebar-area-height,0)",
                } as any)),
            },
          ]}
        >
          <View
            style={[
              styles.header,
              !breakpoints.md && { marginTop: insets.top },
            ]}
          >
            <LogoButton toggleHidden={toggleHidden} />
            <Header />
          </View>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 15,
              width: "100%",
              marginBottom:
                !breakpoints.md || Platform.OS === "web" ? insets.bottom : -8,
              height: "100%",
            }}
          >
            <OpenTabsList />
            <FocusPanel />
          </View>
        </Animated.View>
      )}
    </OnboardingContainer>
  );
});

function SecondarySidebar() {
  const { SECONDARY_SIDEBAR_WIDTH, sidebarRef } = useSidebarContext();
  const theme = useColorTheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        flex: 1,
        width: SECONDARY_SIDEBAR_WIDTH,
        padding: 15,
        paddingRight: 0,
        paddingBottom: breakpoints.md ? undefined : 90 + insets.bottom,
        paddingTop:
          insets.top + (!breakpoints.md || Platform.OS === "web" ? 30 : 0),
        backgroundColor: theme[2],
        zIndex: 999,
      }}
    >
      <IconButton
        icon="west"
        onPress={() => {
          router.replace("/");
          impactAsync(ImpactFeedbackStyle.Light);
          InteractionManager.runAfterInteractions(() => {
            sidebarRef?.current?.openDrawer?.();
          });
        }}
        size={50}
        style={[
          Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
        ]}
      />
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
          icon="tag"
          onPress={() => {
            router.push("/everything");
            impactAsync(ImpactFeedbackStyle.Light);
            if (!breakpoints.md) sidebarRef.current?.closeDrawer?.();
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
            impactAsync(ImpactFeedbackStyle.Light);
            if (!breakpoints.md) sidebarRef.current?.closeDrawer?.();
          }}
          variant={pathname === "/everything/collections" ? "filled" : "text"}
        />
        <Button
          bold
          height={100}
          text="Trash"
          onPress={() => {
            router.push("/everything/trash");
            impactAsync(ImpactFeedbackStyle.Light);
            if (!breakpoints.md) sidebarRef.current?.closeDrawer?.();
          }}
          containerStyle={[
            { borderRadius: 20 },
            Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
          ]}
          style={{ flexDirection: "column" }}
          icon="delete"
          variant={pathname === "/everything/trash" ? "filled" : "text"}
        />
        <Button
          bold
          height={100}
          text="Storage"
          onPress={() => {
            router.push("/everything/storage");
            impactAsync(ImpactFeedbackStyle.Light);
            if (!breakpoints.md) sidebarRef.current?.closeDrawer?.();
          }}
          containerStyle={[
            { borderRadius: 20 },
            Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
          ]}
          style={{ flexDirection: "column" }}
          icon="filter_drama"
          variant={pathname === "/everything/storage" ? "filled" : "text"}
        />
      </View>
    </View>
  );
}

const Sidebar = ({ progressValue }: { progressValue?: any }) => {
  const breakpoints = useResponsiveBreakpoints();
  const pathname = usePathname();
  const { SIDEBAR_WIDTH, ORIGINAL_SIDEBAR_WIDTH, SECONDARY_SIDEBAR_WIDTH } =
    useSidebarContext();
  const theme = useColorTheme();
  const { height } = useWindowDimensions();
  const desktopSlide = useSharedValue(0);

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

  const insets = useSafeAreaInsets();

  const [freezePrimary, setFreezePrimary] = useState(
    !pathname.includes("everything")
  );

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setFreezePrimary(!pathname.includes("everything"));
    });
  }, [pathname]);

  return (
    <SafeView>
      {Platform.OS === "web" && (
        <MiniLogo
          desktopSlide={desktopSlide}
          onHoverIn={() => (desktopSlide.value = 0)}
        />
      )}
      <Animated.View
        style={[
          { flex: breakpoints.md ? undefined : 1 },
          {
            height: height - insets.top - insets.bottom,
            zIndex: breakpoints.md ? 1 : 0,
            flexDirection: "row",
            backgroundColor: theme[2],
            ["WebkitAppRegion" as any]: "no-drag",
          },
          pathname.includes("chrome-extension") && { display: "none" },
        ]}
      >
        <Animated.View
          style={[
            widthStyle,
            {
              flexDirection: "row",
              maxWidth: pathname.includes("everything")
                ? SECONDARY_SIDEBAR_WIDTH
                : ORIGINAL_SIDEBAR_WIDTH,
              overflow: "hidden",
            },
          ]}
        >
          <Animated.View style={primarySidebarStyles}>
            <Freeze freeze={!freezePrimary}>
              <PrimarySidebar progressValue={progressValue} />
            </Freeze>
          </Animated.View>
          <Animated.View
            style={[
              secondarySidebarStyles,
              { height: "100%", width: SECONDARY_SIDEBAR_WIDTH },
            ]}
          >
            <Freeze freeze={freezePrimary}>
              <SecondarySidebar />
            </Freeze>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </SafeView>
  );
};

export default memo(Sidebar);

