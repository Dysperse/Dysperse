import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useStorageContext } from "@/context/storageContext";
import { useHotkeys } from "@/helpers/useHotKeys";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useTabParams } from "@/utils/useTabParams";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import Tab from "./tab";

const SpaceStorageAlert = memo(function SpaceStorageAlert() {
  const redTheme = useColor("red");
  const orangeTheme = useColor("orange");

  const { isLoading, isReached, isWarning } = useStorageContext();
  const alertTheme = { orangeTheme, redTheme }[
    isReached ? "redTheme" : "orangeTheme"
  ];

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web") {
      if (localStorage.getItem("spaceStorageAlert") === "false")
        setIsVisible(false);
    }
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  if (isLoading || (!isVisible && !isReached)) return null;
  if (isReached || isWarning) {
    return (
      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPress={() => router.push("/settings/space")}
        style={({ pressed, hovered }) => ({
          backgroundColor: alertTheme[pressed ? 7 : hovered ? 6 : 5],
          padding: 15,
          borderRadius: 20,
          marginBottom: 5,
          flexDirection: "row",
          gap: 5,
        })}
      >
        {isHovered && Platform.OS === "web" && (
          <IconButton
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            icon={<Icon style={{ color: alertTheme[11] }}>close</Icon>}
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              zIndex: 999,
              backgroundColor: alertTheme[7],
            }}
            onPress={() => {
              localStorage.setItem("spaceStorageAlert", "false");
              setIsVisible(false);
            }}
          />
        )}
        <View style={{ flex: 1 }}>
          <Text
            weight={700}
            style={{ color: alertTheme[11], fontSize: 14, marginBottom: 2 }}
          >
            Your space storage is {!isReached && isWarning && "almost "}full
          </Text>
          <Text style={{ color: alertTheme[11], opacity: 0.7, fontSize: 12 }}>
            Try clearing up some items to free up space
          </Text>
        </View>
        <Icon style={{ color: alertTheme[11] }}>north_east</Icon>
      </Pressable>
    );
  }
});

const JumpToButton = memo(function JumpToButton() {
  const theme = useColorTheme();

  const { handleOpen } = useCommandPaletteContext();

  useHotkeys(["ctrl+k", "ctrl+o", "ctrl+t"], (e) => {
    e.preventDefault();
    handleOpen();
  });

  useHotkeys(["ctrl+/"], (e) => {
    e.preventDefault();
    router.push("/shortcuts");
  });

  return (
    <Pressable
      onPress={() => handleOpen()}
      style={({ pressed, hovered }) => [
        {
          backgroundColor: theme[pressed ? 4 : hovered ? 3 : 2],
          opacity: pressed ? 0.5 : 1,
          flexDirection: "row",
          alignItems: "center",
          columnGap: 15,
          paddingHorizontal: 15,
          borderRadius: 15,
          height: 50,
          marginBottom: 10,
        },
        Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
      ]}
    >
      <Icon bold>add</Icon>
      <Text weight={700} style={{ color: theme[11] }}>
        New tab
      </Text>
    </Pressable>
  );
});

const WebPWAInstallButton = () => {
  // This hook only run once in browser after the component is rendered for the first time.
  // It has same effect as the old componentDidMount lifecycle callback.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;
      // add event listeners to handle any of PWA lifecycle event
      // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-window.Workbox#events
      wb.addEventListener("installed", (event) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      wb.addEventListener("controlling", (event) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      wb.addEventListener("activated", (event) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
      // NOTE: MUST set skipWaiting to false in next.config.js pwa object
      // https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
      const promptNewVersionAvailable = (event) => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.
        if (
          confirm(
            "A newer version of this web app is available, reload to update?"
          )
        ) {
          wb.addEventListener("controlling", (event) => {
            window.location.reload();
          });

          // Send a message to the waiting service worker, instructing it to activate.
          wb.messageSkipWaiting();
        } else {
          console.log(
            "User rejected to reload the web app, keep using old version. New version will be automatically load when user open the app next time."
          );
        }
      };

      wb.addEventListener("waiting", promptNewVersionAvailable);

      // ISSUE - this is not working as expected, why?
      // I could only make message event listenser work when I manually add this listenser into sw.js file
      wb.addEventListener("message", (event) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      wb.register();
    }
  }, []);

  return <View></View>;
};

const OpenTabsList = memo(function OpenTabsList() {
  const { tab }: { tab: string } = useTabParams() as any;
  const { data, error } = useSWR(["user/tabs"]);

  const handleSnapToIndex = (index: number) => {
    if (error)
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    if (!data) return;
    const _tab = data[index];
    if (tab === _tab.id) return;
    router.replace({
      pathname: _tab.slug,
      params: {
        tab: _tab.id,
        ...(typeof _tab.params === "object" && _tab.params),
      },
    });
  };

  useEffect(() => {
    if (tab && Array.isArray(data)) {
      const index = data?.findIndex((i) => i.id === tab);
      if (index !== -1) {
        const recentlyAccessed = JSON.stringify(data[index]);
        AsyncStorage.setItem("recentlyAccessed", recentlyAccessed);
      }
    }
  }, [tab, data]);

  useHotkeys("ctrl+tab", (e) => {
    e.preventDefault();
    const i = data.findIndex((i) => i.id === tab);
    let d = i + 1;
    if (d >= data.length || i === -1) d = 0;
    handleSnapToIndex(d);
  });

  useHotkeys("ctrl+shift+tab", (e) => {
    e.preventDefault();
    const i = data.findIndex((i) => i.id === tab);
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
      if (data[i]) handleSnapToIndex(parseInt(i) - 1);
    }
  );

  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
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
      {data && Array.isArray(data) && data.length > 0 ? (
        <>
          <FlatList
            aria-label="Sidebar"
            data={data}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: theme[2],
                  padding: 1,
                }}
              >
                <Tab tab={item} selected={tab === item.id} />
              </View>
            )}
            style={{ backgroundColor: theme[2] }}
            contentContainerStyle={{ backgroundColor: theme[2] }}
            keyExtractor={(item) => item.id}
          />
          {Platform.OS === "web" && <WebPWAInstallButton />}
          <SpaceStorageAlert />
          <JumpToButton />
        </>
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
                  marginTop: "auto",
                  marginBottom: "auto",
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
              <JumpToButton />
            </>
          ) : (
            <Spinner style={{ marginHorizontal: "auto" }} />
          )}
        </View>
      )}
    </View>
  );
});

export default memo(OpenTabsList);
