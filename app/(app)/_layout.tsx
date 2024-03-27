import { CommandPaletteProvider } from "@/components/command-palette/context";
import { FocusPanelProvider } from "@/components/focus-panel/context";
import { PanelSwipeTrigger } from "@/components/focus-panel/panel";
import LabelPicker from "@/components/labels/picker";
import { JsStack } from "@/components/layout/_stack";
import { forHorizontalIOS } from "@/components/layout/forHorizontalIOS";
import Sidebar from "@/components/layout/sidebar";
import { useSession } from "@/context/AuthProvider";
import {
  SelectionContextProvider,
  useSelectionContext,
} from "@/context/SelectionContext";
import {
  StorageContextProvider,
  useStorageContext,
} from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Portal, PortalProvider } from "@gorhom/portal";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { TransitionPresets } from "@react-navigation/stack";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { BlurView } from "expo-blur";
import * as NavigationBar from "expo-navigation-bar";
import { Redirect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StatusBar,
  View,
  useWindowDimensions,
} from "react-native";
import { Drawer, useDrawerProgress } from "react-native-drawer-layout";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import Markdown from "react-native-markdown-display";
import { MenuProvider } from "react-native-popup-menu";
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";
import useSWR, { useSWRConfig } from "swr";
import { useSidebarContext } from "../../components/layout/sidebar/context";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(isToday);

export function SessionLoadingScreen() {
  const theme = useColorTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme[2],
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <Logo size={150} />
    </View>
  );
}

const AppContainer = ({ children }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const progress = useDrawerProgress();
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    return breakpoints.md
      ? { flex: 1 }
      : {
          flex: 1,
          width: "100%",
          height: "100%",
          borderWidth: withSpring(
            interpolate(Math.round(progress.value), [0, 1], [0, 2]),
            { overshootClamping: true }
          ),
          borderRadius: interpolate(
            progress.value,
            [0, 1],
            [!breakpoints.md ? 0 : 20, 30]
          ),
          borderColor: theme[5],
          overflow: "hidden",
          marginTop: interpolate(progress.value, [0, 1], [0, insets.top]),
          marginBottom: interpolate(progress.value, [0, 1], [0, insets.bottom]),
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1, 0.95]),
            },
          ],
        };
  });

  const marginTopStyle = useAnimatedStyle(() => {
    return {
      marginTop: interpolate(progress.value, [0, 1], [0, -insets.top]),
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Animated.View style={marginTopStyle} />
      {children}
    </Animated.View>
  );
};

const ReleaseModal = () => {
  const { session, mutate, sessionToken } = useUser();
  const theme = useColorTheme();
  const isDark = useDarkMode();
  const { data } = useSWR("releases", {
    fetcher: () =>
      fetch(
        `https://api.github.com/repos/dysperse/dysperse/releases?per_page=1`
      ).then((res) => res.json()),
  });

  const handleDone = () => {
    mutate(
      (d) => {
        return {
          ...d,
          user: { ...d.user, lastReleaseVersionViewed: data?.[0]?.id },
        };
      },
      {
        revalidate: false,
      }
    );
    sendApiRequest(
      sessionToken,
      "PUT",
      "user/account",
      {},
      { body: JSON.stringify({ lastReleaseVersionViewed: data?.[0]?.id }) }
    );
  };

  return (
    data &&
    data?.[0]?.id &&
    session?.user?.lastReleaseVersionViewed !== data?.[0]?.id && (
      <Portal>
        <BlurView
          tint={
            isDark
              ? "systemUltraThinMaterialDark"
              : "systemUltraThinMaterialLight"
          }
          intensity={50}
          style={[
            {
              zIndex: 99,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center",
              justifyContent: "center",
            },
            Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
          ]}
        >
          <Button
            icon="done"
            text="Got it!"
            variant="filled"
            large
            style={({ pressed, hovered }) => ({
              position: "absolute",
              top: 20,
              right: 20,
              zIndex: 99,
              backgroundColor: theme[pressed ? 7 : hovered ? 6 : 5],
            })}
            onPress={handleDone}
          />
          <ScrollView
            style={{
              width: "100%",
              padding: 20,
              maxWidth: 700,
              paddingVertical: 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={{ fontSize: 50, color: theme[11] }} weight={900}>
              What's new!?
            </Text>
            <Text
              style={{ fontSize: 33, color: theme[11], opacity: 0.6 }}
              weight={500}
            >
              {data?.[0]?.name} &bull;{" "}
              {dayjs(data?.[0]?.published_at).fromNow()}
            </Text>
            <Markdown
              style={{
                body: {
                  color: theme[11],
                  fontFamily: "body_400",
                  fontSize: 15,
                },
                heading1: { fontFamily: "body_800", fontSize: 30 },
                heading2: { fontFamily: "body_800", fontSize: 27 },
                heading3: {
                  fontFamily: "body_800",
                  marginTop: 20,
                  fontSize: 24,
                },
              }}
            >
              {data?.[0]?.body?.split("<!--dysperse-changelog-end-->")?.[0] ||
                ""}
            </Markdown>
          </ScrollView>
        </BlurView>
      </Portal>
    )
  );
};

const LoadingErrors = () => {
  const red = useColor("red");
  const theme = useColorTheme();
  const { error } = useUser();
  const { error: storageError } = useStorageContext();
  const insets = useSafeAreaInsets();

  return (
    (error || storageError) && (
      <View
        style={[
          {
            backgroundColor: theme[11],
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 30 + insets.top,
            gap: 10,
          },
        ]}
      >
        <Icon style={{ color: red[2] }} bold size={18}>
          cloud_off
        </Icon>
        <Text
          style={{ color: red[2], fontSize: 12, marginBottom: -1 }}
          weight={700}
        >
          {error
            ? error.message === "Failed to fetch"
              ? "You're offline"
              : "Can't connect to Dysperse"
            : "Can't load storage data"}
        </Text>
      </View>
    )
  );
};

const SelectionNavbar = () => {
  const { mutate } = useSWRConfig();
  const { session } = useSession();
  const { width } = useWindowDimensions();
  const { selection, setSelection } = useSelectionContext();
  const blue = useColor("blue");

  const barWidth = 440;
  const clearSelection = useCallback(() => setSelection([]), [setSelection]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = useCallback(
    async (t, shouldClear = false) => {
      try {
        setIsLoading(true);
        await sendApiRequest(
          session,
          "PUT",
          "space/entity",
          {},
          {
            body: JSON.stringify({ id: selection, ...t }),
          }
        );
        await mutate(() => true);
        if (shouldClear) clearSelection();
      } catch (e) {
        Toast.show({ type: "error" });
      } finally {
        setIsLoading(false);
      }
    },
    [selection, clearSelection, mutate, session]
  );

  useHotkeys("Escape", clearSelection, {
    enabled: selection.length > 0,
  });

  const [pinned, setPinned] = useState(true);

  return selection.length > 0 ? (
    <Portal>
      <ColorThemeProvider theme={blue}>
        <View
          style={{
            width: barWidth,
            height: 64,
            position: "absolute",
            top: 0,
            left: (width - barWidth) / 2,
            marginTop: 20,
            backgroundColor: blue[5],
            flexDirection: "row",
            borderRadius: 999,
            zIndex: 999999,
            gap: 10,
            paddingHorizontal: 10,
            paddingRight: 15,
            alignItems: "center",
          }}
        >
          <IconButton icon="close" size={50} onPress={clearSelection} />
          <View style={{ flexGrow: 1 }}>
            <Text weight={900} style={{ fontSize: 20 }}>
              {selection.length} selected
            </Text>
            {isLoading && (
              <Text style={{ opacity: 0.6, fontSize: 12 }}>Processing...</Text>
            )}
          </View>
          <View style={{ flexDirection: "row" }}>
            <IconButton
              disabled={isLoading}
              onPress={() => {
                setPinned((t) => !t);
                handleSelect({ pinned });
              }}
              icon={<Icon filled={pinned}>push_pin</Icon>}
              size={45}
            />
            <LabelPicker
              setLabel={(e: any) => handleSelect({ labelId: e.id })}
              autoFocus
            >
              <IconButton disabled={isLoading} icon="new_label" size={45} />
            </LabelPicker>
            <ConfirmationModal
              onSuccess={() => handleSelect({ trash: true }, true)}
              title={`Move ${selection.length} item${
                selection.length === 1 ? "" : "s"
              } to trash?`}
              height={400}
              skipLoading
              secondary="You can undo this later"
            >
              <IconButton disabled={isLoading} icon="delete" size={45} />
            </ConfirmationModal>
          </View>
        </View>
      </ColorThemeProvider>
    </Portal>
  ) : null;
};

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { session: sessionData, isLoading: isUserLoading } = useUser();
  const { width, height } = useWindowDimensions();
  const isDark = useDarkMode();
  const {
    SIDEBAR_WIDTH,
    isOpen,
    openSidebar,
    closeSidebar,
    desktopCollapsed,
    setDesktopCollapsed,
  } = useSidebarContext();
  const breakpoints = useResponsiveBreakpoints();

  const theme = useColor(sessionData?.user?.profile?.theme || "mint");

  if (Platform.OS === "android") {
    NavigationBar.setBackgroundColorAsync(addHslAlpha(theme[1], 0.05));
  }

  useEffect(() => {
    if (Platform.OS === "web") {
      document
        .querySelector(`meta[name="theme-color"]`)
        .setAttribute("content", theme[2]);
    }
  }, [theme, breakpoints.md]);

  if (isLoading || isUserLoading) {
    return (
      <ColorThemeProvider theme={theme}>
        <SessionLoadingScreen />
      </ColorThemeProvider>
    );
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/auth" />;
  }

  // This layout can be deferred because it's not the root layout.

  return (
    <SelectionContextProvider>
      <StorageContextProvider>
        <ColorThemeProvider theme={theme} setHTMLAttributes>
          <GestureHandlerRootView
            style={{
              flex: 1,
              overflow: "hidden",
              width,
              height,
              backgroundColor: theme[2],
            }}
          >
            <BottomSheetModalProvider>
              <MenuProvider
                customStyles={{
                  backdrop: {
                    flex: 1,
                    opacity: 1,
                  },
                }}
              >
                <PortalProvider>
                  <StatusBar
                    barStyle={!isDark ? "dark-content" : "light-content"}
                  />
                  <View
                    style={[
                      {
                        flexDirection: "row",
                        flex: 1,
                        backgroundColor: theme[2],
                      },
                      Platform.OS === "web" &&
                        ({ WebkitAppRegion: "drag" } as any),
                    ]}
                  >
                    <CommandPaletteProvider>
                      <FocusPanelProvider>
                        <ThemeProvider
                          value={{
                            ...DefaultTheme,
                            colors: {
                              ...DefaultTheme.colors,
                              background: theme[breakpoints.sm ? 2 : 1],
                            },
                          }}
                        >
                          <Animated.View
                            style={[
                              breakpoints.md ? { flex: 1 } : { width: "100%" },
                            ]}
                          >
                            <ReleaseModal />
                            <LoadingErrors />
                            <Drawer
                              open={isOpen}
                              onOpen={openSidebar}
                              onClose={closeSidebar}
                              drawerPosition={"left"}
                              drawerType={
                                breakpoints.md
                                  ? desktopCollapsed
                                    ? "front"
                                    : "permanent"
                                  : "back"
                              }
                              swipeEdgeWidth={1000}
                              drawerStyle={{
                                // height,
                                width: breakpoints.md
                                  ? desktopCollapsed
                                    ? SIDEBAR_WIDTH
                                    : "auto"
                                  : SIDEBAR_WIDTH,
                                backgroundColor: "transparent",
                              }}
                              overlayStyle={{
                                backgroundColor: "transparent",
                              }}
                              renderDrawerContent={() => (
                                <GestureDetector
                                  gesture={Gesture.Hover()
                                    .onStart(openSidebar)
                                    .onEnd(closeSidebar)
                                    .enabled(
                                      breakpoints.md && desktopCollapsed
                                    )}
                                >
                                  <Pressable style={{ flexDirection: "row" }}>
                                    <Sidebar />
                                    {breakpoints.md && (
                                      <GestureDetector
                                        gesture={Gesture.Tap().onEnd(() => {
                                          setDesktopCollapsed((t) => !t);
                                          closeSidebar();
                                        })}
                                      >
                                        <PanelSwipeTrigger side="left" />
                                      </GestureDetector>
                                    )}
                                  </Pressable>
                                </GestureDetector>
                              )}
                            >
                              <AppContainer>
                                <SelectionNavbar />
                                <JsStack
                                  screenOptions={{
                                    header: () => null,
                                    headerTransparent: true,
                                    gestureResponseDistance: width,
                                    gestureEnabled: false,
                                    cardStyle: {
                                      height,
                                      width: breakpoints.md ? "100%" : width,
                                      backgroundColor:
                                        theme[breakpoints.sm ? 2 : 1],
                                      padding: breakpoints.md ? 10 : 0,
                                      ...(Platform.OS === "web" &&
                                        ({
                                          marginTop:
                                            "env(titlebar-area-height,0)",
                                        } as any)),
                                    },
                                    // change opacity of the previous screen when swipe
                                    cardOverlayEnabled: true,
                                    animationEnabled: false,
                                    gestureVelocityImpact: 0.7,
                                  }}
                                >
                                  <JsStack.Screen name="index" />
                                  {[
                                    "everything/labels/[id]",
                                    "everything/collections/[id]",
                                  ].map((d) => (
                                    <JsStack.Screen
                                      key={d}
                                      name={d}
                                      options={{
                                        presentation: "modal",
                                        animationEnabled: true,
                                        ...TransitionPresets.ModalPresentationIOS,
                                      }}
                                    />
                                  ))}
                                  {[
                                    "settings/customization/appearance",
                                    "settings/customization/notifications",
                                    "settings/login/scan",
                                    "settings/login/account/index",
                                    "settings/login/account/two-factor-authentication",
                                    "settings/login/devices",
                                    "settings/customization/profile",
                                    "settings/index",
                                    "settings/personal-information",
                                    "settings/space/index",
                                    "settings/space/integrations/index",
                                    "settings/space/integrations/[name]/index",
                                    "settings/space/integrations/[name]/[id]",
                                  ].map((d) => (
                                    <JsStack.Screen
                                      name={d}
                                      key={d}
                                      options={{
                                        cardStyle: { padding: 0 },
                                        gestureEnabled: d !== "settings/index",
                                        headerTitle:
                                          d !== "settings/index" && "Settings",
                                        ...TransitionPresets.SlideFromRightIOS,
                                        cardStyleInterpolator: forHorizontalIOS,
                                        ...(breakpoints.md && {
                                          animationEnabled: false,
                                        }),
                                      }}
                                    />
                                  ))}
                                  <JsStack.Screen
                                    name="friends"
                                    options={{
                                      gestureEnabled: true,
                                      ...TransitionPresets.SlideFromRightIOS,
                                      cardStyleInterpolator: forHorizontalIOS,
                                    }}
                                  />
                                  {["clock", "collections/create"].map((d) => (
                                    <JsStack.Screen
                                      name={d}
                                      key={d}
                                      options={{
                                        ...TransitionPresets.SlideFromRightIOS,
                                        gestureResponseDistance: width,
                                        cardStyleInterpolator: forHorizontalIOS,
                                        // cardStyle: { marginBottom: 0 },
                                      }}
                                    />
                                  ))}
                                </JsStack>
                              </AppContainer>
                            </Drawer>
                          </Animated.View>
                        </ThemeProvider>
                      </FocusPanelProvider>
                    </CommandPaletteProvider>
                  </View>
                </PortalProvider>
              </MenuProvider>
            </BottomSheetModalProvider>
            <Toast config={toastConfig(theme)} />
          </GestureHandlerRootView>
        </ColorThemeProvider>
      </StorageContextProvider>
    </SelectionContextProvider>
  );
}
