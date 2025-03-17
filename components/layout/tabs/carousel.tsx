import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useFocusPanelContext } from "@/components/focus-panel/context";
import { useBadgingService } from "@/context/BadgingProvider";
import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import {
  createSortablePayloadByIndex,
  getBetweenRankAsc,
} from "@/helpers/lexorank";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import RefreshControl from "@/ui/RefreshControl";
import CircularSkeleton from "@/ui/Skeleton/circular";
import LinearSkeleton from "@/ui/Skeleton/linear";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha, useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useGlobalSearchParams } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from "react-native-reorderable-list";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import PWAInstallerPrompt from "../PWAInstaller";
import ReleaseModal from "../ReleaseModal";
import { useSidebarContext } from "../sidebar/context";
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
      <Button
        onPress={() => router.push("/everything/storage")}
        backgroundColors={{
          default: alertTheme[5],
          hovered: alertTheme[6],
          pressed: alertTheme[7],
        }}
        style={{
          padding: 0,
          flexDirection: "row",
          gap: 5,
          ...(Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any)),
        }}
        containerStyle={{ borderRadius: 20, marginBottom: 5, padding: 15 }}
        height={100}
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
      </Button>
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

  // const data = raw.sort((a, b) => a.order.localeCompare(b.order));

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
  const breakpoints = useResponsiveBreakpoints();

  const badgingRef = useBadgingService();
  const [badgeData, setBadgeData] = useState(badgingRef.current.data);

  const { sidebarRef, desktopCollapsed } = useSidebarContext();
  const { handleOpen } = useCommandPaletteContext();

  const onOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (!breakpoints.md || desktopCollapsed) sidebarRef.current?.closeDrawer();
    if (Platform.OS !== "web") setTimeout(handleOpen, 600);
    else handleOpen();
  };

  useHotkeys(["ctrl+k", "ctrl+o", "ctrl+t"], (e) => {
    e.preventDefault();
    onOpen();
  });

  useHotkeys(["ctrl+/"], (e) => {
    e.preventDefault();
    router.push("/settings/shortcuts");
  });

  const { widgets } = useFocusPanelContext();
  const { sessionToken } = useUser();

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    mutate(
      (oldItems) => {
        // 1. find prev, current, next items
        const sortablePayload = createSortablePayloadByIndex(oldItems, {
          fromIndex: from,
          toIndex: to,
        });
        // 2. calculate new rank
        const newRank = getBetweenRankAsc(sortablePayload);
        const newItems = [...oldItems];
        const currIndex = oldItems.findIndex(
          (x) => x.id === sortablePayload.entity.id
        );
        // 3. replace current rank
        newItems[currIndex] = {
          ...newItems[currIndex],
          order: newRank.toString(),
        };
        // 4. update server with tab's new rank
        sendApiRequest(
          sessionToken,
          "PUT",
          "user/tabs",
          {},
          {
            body: JSON.stringify({
              id: sortablePayload.entity.id,
              order: newRank.toString(),
            }),
          }
        );
        // 5. sort by rank
        return reorderItems(oldItems, from, to);
      },
      { revalidate: false }
    );
  };

  const newTab = (
    <Button
      icon="add"
      text="New tab"
      onPress={onOpen}
      backgroundColors={{
        default: theme[2],
        hovered: theme[3],
        pressed: theme[4],
      }}
      height={50}
      iconStyle={{
        marginLeft: breakpoints.md ? -2 : 1,
        marginRight: breakpoints.md ? -3 : -1,
      }}
      containerStyle={{
        borderRadius: 15,
      }}
      style={{ justifyContent: "flex-start", columnGap: 15 }}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      {data && Array.isArray(data) && data.length > 0 ? (
        <View style={{ flex: 1, marginTop: -10 }}>
          <LinearGradient
            colors={[theme[2], addHslAlpha(theme[2], 0)]}
            style={{
              height: 10,
              marginBottom: -10,
              zIndex: 999,
              pointerEvents: "none",
            }}
          />
          <ReorderableList
            onReorder={handleReorder}
            showsVerticalScrollIndicator={false}
            aria-label="Sidebar"
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={() => {
                  badgingRef.current.mutate().then((e) => setBadgeData(e));
                  mutate();
                }}
              />
            }
            ListFooterComponentStyle={{ marginTop: "auto" }}
            ListFooterComponent={() => (
              <View style={{ padding: 1, paddingHorizontal: 10 }}>
                {newTab}
              </View>
            )}
            data={data}
            style={{ marginHorizontal: -10 }}
            getItemLayout={(_, index) => ({ length: 52, offset: 52, index })}
            renderItem={({ item }) => (
              <View style={{ padding: 1, paddingHorizontal: 10 }}>
                <Tab
                  tab={item}
                  tabs={data}
                  mutate={mutate}
                  selected={tab === item.id}
                  badgeData={badgeData}
                />
              </View>
            )}
            contentContainerStyle={{
              paddingVertical: 10,
              paddingTop: 5,
              paddingHorizontal: Platform.OS === "web" && 10,
              minHeight: widgets.find((i) => i.pinned) ? undefined : "100%",
            }}
            keyExtractor={(item) => item.id}
          />
          <LinearGradient
            colors={[addHslAlpha(theme[2], 0), theme[2]]}
            style={{
              height: 10,
              marginTop: -10,
              zIndex: 999,
              pointerEvents: "none",
            }}
          />
          {Platform.OS === "web" && <WebPWAInstallButton />}
          <SpaceStorageAlert />
          {/* {footer} */}
        </View>
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
                {newTab}
              </View>
            </>
          ) : (
            <View style={{ flex: 1, gap: 25, marginTop: 10, marginLeft: 5 }}>
              {[...new Array(7)].map((_, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <CircularSkeleton size={35} />
                  <View style={{ flex: 1, gap: 7 }}>
                    <LinearSkeleton
                      height={13}
                      width={Platform.OS === "web" ? "85%" : "75%"}
                    />
                    <LinearSkeleton
                      height={13}
                      width={Platform.OS === "web" ? "50%" : "45%"}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default memo(OpenTabsList);

