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
import { router, useGlobalSearchParams } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import PWAInstallerPrompt from "../PWAInstaller";
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
        onPress={() => router.push("/settings/account")}
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
    router.push("/settings/shortcuts");
  });

  return (
    <Pressable
      onPress={() => handleOpen()}
      style={({ pressed, hovered }) => [
        {
          backgroundColor: pressed ? theme[5] : hovered ? theme[4] : undefined,
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
        wb.addEventListener("controlling", () => {
          window.location.reload();
        });

        wb.messageSkipWaiting();
      };

      wb.addEventListener("waiting", promptNewVersionAvailable);
      wb.register();
    }
  }, []);

  const handleReload = () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
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
  const { data, error, mutate } = useSWR(["user/tabs"], {
    refreshInterval: 60000,
  });

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
}

export default memo(OpenTabsList);
