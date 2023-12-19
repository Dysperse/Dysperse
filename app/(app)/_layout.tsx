import AccountNavbar from "@/components/layout/account-navbar";
import { CreateDrawer } from "@/components/layout/bottom-navigation/create-drawer";
import { useSession } from "@/context/AuthProvider";
import { OpenTabsProvider, useOpenTab } from "@/context/tabs";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import Navbar from "@/ui/navbar";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Stack, router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SectionList,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { SWRConfig } from "swr";
import { BottomAppBar } from "../../components/layout/bottom-navigation";
import { OpenTabsList } from "../../components/layout/bottom-navigation/tabs/carousel";
import { getSidebarItems } from "./open";

dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(utc);

export const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

function Button({ section, item }) {
  const [loading, setLoading] = useState(false);
  const redPalette = useColor("red", useColorScheme() === "dark");
  const purplePalette = useColor("purple", useColorScheme() === "dark");
  const { session } = useSession();
  const colors = { redPalette, purplePalette }[
    section.title === "Collections" ? "purplePalette" : "redPalette"
  ];

  const handlePress = async (item) => {
    try {
      setLoading(true);
      const res = await sendApiRequest(
        session,
        "POST",
        "user/tabs",
        {
          ...(item.collection
            ? {
                boardId: item.collection.id,
              }
            : {
                tabData: JSON.stringify({
                  href: item.href,
                  icon: item.icon,
                  label: item.label,
                }),
              }),
        },
        null
      );
      console.log(res);
      router.push(item.href);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert("Something went wrong. Please try again later");
    }
  };
  const theme = useColorTheme();

  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: theme[pressed ? 3 : 2],
        paddingHorizontal: 20,
        paddingVertical: 7,
        flexDirection: "row",
        gap: 15,
        alignItems: "center",
      })}
      onPress={() => handlePress(item)}
    >
      <LinearGradient
        colors={[colors[5], colors[3]]}
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {item.collection ? (
          <Emoji size={21} emoji={item.collection.emoji || "1f4e6"} />
        ) : (
          <Icon size={21} style={{ color: colors[12] }}>
            {item.icon}
          </Icon>
        )}
      </LinearGradient>
      <Text textClassName="flex-1">{item?.collection?.name || item.label}</Text>

      {loading && <ActivityIndicator />}
    </Pressable>
  );
}
function Sidebar() {
  const theme = useColorTheme();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getSidebarItems(session).then((sections) => {
      setData(sections);
      setIsLoading(false);
    });
  }, []);

  const { height } = useWindowDimensions();

  return (
    <View
      style={{
        height: "100%",
        backgroundColor: theme[2],
        width: 240,
        flexDirection: "column",
        maxHeight: height,
      }}
    >
      <View
        style={{
          height: 70,
          paddingHorizontal: 20,
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Logo color={theme[6]} size={35} />
        <IconButton style={{ marginLeft: "auto" }}>
          <Icon style={{ color: theme[8] }}>workspaces</Icon>
        </IconButton>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <CreateDrawer>
          <Pressable
            style={({ pressed, hovered }: any) => ({
              flexDirection: "row",
              backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              shadowColor: theme[4],
              borderWidth: 2,
              borderColor: theme[pressed ? 7 : hovered ? 6 : 5],
              shadowRadius: 10,
              marginBottom: 15,
              shadowOffset: { height: 5, width: 0 },
              borderRadius: 8,
              paddingHorizontal: 15,
              paddingVertical: 5,
              alignItems: "center",
              gap: 15,
              ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
            })}
          >
            <Icon bold style={{ opacity: 0.8 }}>
              add
            </Icon>
            <Text style={{ color: theme[11] }} weight={700}>
              Create
            </Text>
          </Pressable>
        </CreateDrawer>
      </View>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <SectionList
          sections={data}
          ListEmptyComponent={
            <View className="items-center h-full">
              <Emoji emoji="1F62D" size={40} />
              <Text
                textClassName="mt-3"
                style={{ fontFamily: "body_600", fontSize: 17 }}
              >
                No results found
              </Text>
            </View>
          }
          renderItem={({ item, section }) => (
            <Button item={item} section={section} />
          )}
          renderSectionHeader={({ section }) => (
            <Text
              variant="eyebrow"
              style={{ paddingHorizontal: 20, marginBottom: 10, marginTop: 20 }}
            >
              {section.title}
            </Text>
          )}
          keyExtractor={(item) => `basicListEntry-${item.href}`}
        />
      )}
    </View>
  );
}

function TabHandler() {
  const { session } = useUser();
  const { activeTab, setActiveTab } = useOpenTab();
  const pathname = usePathname();

  useEffect(() => {
    if (session) {
      const tab = session.user.tabs.find(
        (tab) => tab?.tabData?.href === pathname
      );
      if (tab) {
        setActiveTab(tab.id);
      }
    }
  }, [activeTab, pathname, setActiveTab, session]);

  return null;
}

function DesktopHeader() {
  return (
    <View
      style={{
        height: 64,
        justifyContent: "center",
      }}
    >
      <OpenTabsList />
    </View>
  );
}

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { session: sessionData, isLoading: isUserLoading } = useUser();
  const { width } = useWindowDimensions();
  const isDark = useColorScheme() === "dark";

  const theme = useColor(
    sessionData?.user?.color || "violet",
    // CHANGE THIS LATER!!!
    isDark
    // sessionData?.user?.darkMode === "dark"
  );
  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading || isUserLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <PortalProvider>
      <ColorThemeProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <OpenTabsProvider>
            <TabHandler />
            <BottomSheetModalProvider>
              <SWRConfig
                value={{
                  fetcher: async ([
                    resource,
                    params,
                    host = "https://api.dysperse.com",
                    init = {},
                  ]) => {
                    const url = `${host}/${resource}?${new URLSearchParams(
                      params
                    ).toString()}`;
                    const res = await fetch(url, {
                      headers: {
                        Authorization: `Bearer ${session}`,
                      },
                      ...init,
                    });
                    return await res.json();
                  },
                }}
              >
                <StatusBar
                  barStyle={!isDark ? "dark-content" : "light-content"}
                />
                <View
                  style={{
                    flexDirection: width > 600 ? "row" : "column",
                    height: "100%",
                  }}
                >
                  {width > 600 && <Sidebar />}
                  <Stack
                    screenOptions={{
                      header:
                        width > 600
                          ? DesktopHeader
                          : (props: any) => <AccountNavbar {...props} />,
                      headerTransparent: true,
                      fullScreenGestureEnabled: true,
                      contentStyle: {
                        backgroundColor: theme[width > 600 ? 2 : 1],
                      },
                    }}
                  >
                    <Stack.Screen
                      name="index"
                      options={{
                        animation: "fade",
                      }}
                    />
                    <Stack.Screen
                      name="account"
                      options={{
                        header: (props) => <Navbar {...props} />,
                        headerTitle: "Account",
                        animation: "slide_from_right",
                      }}
                    />
                    <Stack.Screen
                      name="open"
                      options={{
                        header: (props) => <Navbar {...props} />,
                        animation: "fade",
                        presentation: "modal",
                      }}
                    />
                    <Stack.Screen
                      name="perspectives/agenda/[type]/[start]"
                      options={{
                        animation: "fade",
                        header: width > 600 ? DesktopHeader : () => null,
                      }}
                    />
                  </Stack>
                  {width < 600 && <BottomAppBar />}
                </View>
              </SWRConfig>
            </BottomSheetModalProvider>
            <Toast config={toastConfig(theme)} />
          </OpenTabsProvider>
        </GestureHandlerRootView>
      </ColorThemeProvider>
    </PortalProvider>
  );
}
