import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import { InteractionManager, Platform, StyleSheet, View } from "react-native";
import { useReorderableDrag } from "react-native-reorderable-list";
import Toast from "react-native-toast-message";
import { useTabMetadata } from "./useTabMetadata";

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    flexDirection: "row",
    columnGap: 15,
    paddingLeft: 15,
  },
  text: { fontSize: 12, opacity: 0.6 },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "transparent",
  },
  closeIcon: { opacity: 0.6 },
});

function Tab({
  tab,
  disabled = false,
  isList = false,
  selected = false,
  tabs,
  mutate,
  badgeData,
}: {
  tab: any;
  disabled?: boolean;
  isList?: boolean;
  selected?: boolean;
  tabs: any;
  mutate: any;
  badgeData: any;
}) {
  const theme = useColorTheme();
  const tabData = useTabMetadata(tab.slug, tab);
  const { sessionToken } = useUser();
  const { sidebarRef, desktopCollapsed } = useSidebarContext();
  const drag = useReorderableDrag();

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        if (!tabs) {
          return Toast.show({
            type: "error",
            text1: "Couldn't load tabs. Please try again later.",
          });
        }
        setIsClosedAnimation(true);
        // get last tab
        const tab = tabs.findIndex((tab: any) => tab.id === id);
        const lastTab = tabs[tab - 1] || tabs[tab + 1];
        if (lastTab) {
          router.replace({
            params: {
              tab: lastTab.id,
              ...(typeof lastTab.params === "object" && lastTab.params),
            },
            pathname: lastTab.slug,
          });
        } else {
          router.replace("/home");
        }
        mutate((oldData) => oldData.filter((oldTab: any) => oldTab.id !== id), {
          revalidate: false,
        });
        sendApiRequest(sessionToken, "DELETE", "user/tabs", {
          id,
        });
      } catch (err) {
        setIsClosedAnimation(false);
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later.",
        });
        console.log(err);
      }
    },
    [mutate, sessionToken, tabs]
  );

  const [isClosedAnimation, setIsClosedAnimation] = useState(false);
  const breakpoints = useResponsiveBreakpoints();

  const handleCloseTab = useCallback(
    async () => await handleDelete(tab.id),
    [handleDelete, tab]
  );
  const tabName = useMemo(
    () =>
      tab.collection?.name ||
      tab.label?.name ||
      capitalizeFirstLetter(tabData.name(tab.params, tab.slug)[0]) ||
      "",
    [tab, tabData]
  );

  const TabIcon = ({ inline }: { inline?: boolean }) => (
    <Icon size={inline ? 13 : 24} style={inline && { marginTop: -2 }}>
      {typeof tabData?.icon === "function"
        ? tabData?.icon?.(tab.params)
        : tabData?.icon}
    </Icon>
  );

  const closeIcon = useMemo(
    () => (
      <IconButton
        disabled={!selected}
        style={[
          styles.closeButton,
          {
            opacity: selected ? 0.5 : 0,
            pointerEvents: selected ? "auto" : "none",
          },
        ]}
        size={50}
        onPress={handleCloseTab}
      >
        <Icon size={20} style={[styles.closeIcon]}>
          close
        </Icon>
      </IconButton>
    ),
    [selected, handleCloseTab]
  );

  const tabContent = useMemo(
    () => (
      <>
        {tab.collection || tab.label ? (
          <View style={{ position: "relative" }}>
            <Avatar
              disabled
              style={{
                backgroundColor: "transparent",
                shadowRadius: 0,
                borderRadius: 0,
              }}
              size={23}
            >
              <Emoji emoji={tab.collection?.emoji || tab.label?.emoji} />
            </Avatar>
            {badgeData?.collections.find((t) => t.id === tab.collectionId) &&
              badgeData.collections.find((t) => t.id === tab.collectionId)
                .total > 0 && (
                <View
                  style={{
                    minWidth: 17,
                    paddingHorizontal: 3,
                    height: 17,
                    borderRadius: 7,
                    position: "absolute",
                    right: -3,
                    bottom: -5,
                    backgroundColor: theme[5],
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      letterSpacing: -1,
                      color: theme[11],
                    }}
                    weight={900}
                  >
                    {Math.min(
                      badgeData.collections.find(
                        (t) => t.id === tab.collectionId
                      ).total,
                      9
                    )}
                    {badgeData.collections.find(
                      (t) => t.id === tab.collectionId && t.total > 9
                    ) && "+"}
                  </Text>
                </View>
              )}
          </View>
        ) : (
          <TabIcon />
        )}
        <View style={{ flex: 1 }}>
          <Text weight={400} numberOfLines={1} style={{ color: theme[11] }}>
            {tabName}
          </Text>
          {tabData.name(tab.params, tab.slug)[1] && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: -2,
                gap: 3,
              }}
            >
              {(tab.collection || tab.label) && <TabIcon inline />}
              <Text
                style={[styles.text, { color: theme[11] }]}
                numberOfLines={1}
                weight={400}
              >
                {capitalizeFirstLetter(
                  tabData.name(tab.params, tab.slug)[1] || ""
                )}
              </Text>
            </View>
          )}
        </View>
        {closeIcon}
      </>
    ),
    [tab, tabData, theme, tabName, closeIcon, badgeData, selected]
  );

  const handlePress = useCallback(() => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    AsyncStorage.setItem("lastViewedTab", tab.id);
    router.replace({
      pathname: tab.slug,
      params: {
        ...tab.params,
        tab: tab.id,
      },
    });
    InteractionManager.runAfterInteractions(() => {
      if (!breakpoints.md || desktopCollapsed)
        sidebarRef?.current?.closeDrawer?.();
    });
  }, [breakpoints, sidebarRef, tab]);

  useHotkeys(
    "ctrl+w",
    (e) => {
      e.preventDefault();
      if (selected) handleCloseTab();
    },
    [selected]
  );

  return isClosedAnimation ? null : (
    <View
      style={[
        {
          width: "100%",
          borderRadius: 15,
          overflow: "hidden",
        },
        Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
      ]}
    >
      <Button
        {...(Platform.OS === "web" && {
          onAuxClick: (e) => {
            if (e.button === 1) {
              e.preventDefault();
              handleDelete(tab.id);
            }
          },
        })}
        onLongPress={
          Platform.OS === "web"
            ? undefined
            : () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                drag();
              }
        }
        disabled={disabled}
        variant={selected ? "filled" : "text"}
        onPress={handlePress}
        height={50}
        backgroundColors={
          selected
            ? {
                default: theme[3],
                pressed: theme[4],
                hovered: theme[5],
              }
            : {
                default: addHslAlpha(theme[3], 0),
                pressed: theme[3],
                hovered: theme[4],
              }
        }
        style={[
          styles.button,
          {
            paddingHorizontal: isList ? 13 : breakpoints.md ? 10 : 10,
            paddingRight: selected ? 30 : undefined,
          },
        ]}
        containerStyle={{ borderRadius: 15 }}
      >
        {tabContent}
      </Button>
    </View>
  );
}

export default memo(Tab);
