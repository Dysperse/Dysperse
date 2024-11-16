import { useStorageContext } from "@/context/storageContext";
import { useHotkeys } from "@/helpers/useHotKeys";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import PWAInstallerPrompt from "../PWAInstaller";
import ReleaseModal from "../ReleaseModal";
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

  if (isLoading || (!isVisible && !isReached)) return null;
  if (isReached || isWarning) {
    return (
      <Pressable
        onPress={() => router.push("/settings/storage")}
        style={({ pressed, hovered }) => ({
          backgroundColor: alertTheme[pressed ? 7 : hovered ? 6 : 5],
          padding: 15,
          borderRadius: 20,
          marginBottom: 5,
          flexDirection: "row",
          gap: 5,
          ...(Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any)),
        })}
      >
        <View style={{ flex: 1 }}>
          <Text
            weight={700}
            style={{ color: alertTheme[11], fontSize: 14, marginBottom: 2 }}
          >
            Your storage is {!isReached && isWarning && "almost "}full
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

const pwaPromptStyles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 15,
    gap: 15,
    marginBottom: 5,
  },
});

const WebPWAInstallButton = () => {
  const theme = useColorTheme();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;
      const promptNewVersionAvailable = () => {
        setUpdating(true);
        wb.addEventListener("controlling", () => window.location.reload());
        wb.messageSkipWaiting();
      };
      wb.addEventListener("waiting", promptNewVersionAvailable);
      wb.register();
    }
  }, []);

  const handleReload = () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        registrations.forEach((registration) => registration.unregister())
      );
    window.location.reload();
  };

  return (
    <View>
      {updating && (
        <Pressable
          onPress={handleReload}
          style={({ pressed, hovered }) => [
            pwaPromptStyles.banner,
            { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text weight={700} style={{ marginBottom: 3, color: theme[11] }}>
              Dysperse is ready to update!
            </Text>
            <Text
              style={{ fontSize: 12, color: theme[11], opacity: 0.6 }}
              weight={500}
            >
              App will automatically reload after installing
            </Text>
          </View>
          <Spinner />
        </Pressable>
      )}

      <ReleaseModal />
      {Platform.OS === "web" && (
        <PWAInstallerPrompt
          render={({ onClick }) => (
            <Pressable
              onPress={onClick}
              style={({ pressed, hovered }) => [
                pwaPromptStyles.banner,
                { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
              ]}
            >
              <Icon>download</Icon>
              <Text style={{ color: theme[11] }} weight={700}>
                Install app
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

function OpenTabsList() {
  const { tab } = useGlobalSearchParams();
  const { data, error, mutate } = useSWR(["user/tabs"]);

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

  useHotkeys(["ctrl+tab", "alt+ArrowDown"], (e) => {
    e.preventDefault();
    const i = data.findIndex((i) => i.id === tab);
    let d = i + 1;
    if (d >= data.length || i === -1) d = 0;
    handleSnapToIndex(d);
  });

  useHotkeys(["ctrl+shift+tab", "alt+ArrowUp"], (e) => {
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
  const path = usePathname();

  const footer = (
    <View style={{ marginBottom: 5, flexDirection: "row" }}>
      <JumpToButton />
      <IconButton
        size={50}
        style={{
          ...(Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any)),
        }}
        onPress={() => router.push("/everything")}
        variant={path === "/everything" ? "filled" : undefined}
      >
        <Icon bold>home_storage</Icon>
      </IconButton>
    </View>
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
      {data && Array.isArray(data) && data.length > 0 ? (
        <>
          <FlatList
            aria-label="Sidebar"
            data={data}
            renderItem={({ item }) => (
              <View style={{ padding: 1 }}>
                <Tab
                  tab={item}
                  tabs={data}
                  mutate={mutate}
                  selected={tab === item.id}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
          {Platform.OS === "web" && <WebPWAInstallButton />}
          <SpaceStorageAlert />
          {footer}
        </>
      ) : (
        ""
      )}
    </View>
  );
}

export default memo(OpenTabsList);

