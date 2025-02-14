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
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { InteractionManager, Platform, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { useTabMetadata } from "./useTabMetadata";

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    flexDirection: "row",
    columnGap: 10,
  },
  text: { marginTop: -3, fontSize: 12, opacity: 0.6 },
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
  onLongPress = () => {},
  tabs,
  mutate,
  badgeData,
}: {
  tab: any;
  disabled?: boolean;
  isList?: boolean;
  selected?: boolean;
  onLongPress?: () => void;
  tabs: any;
  mutate: any;
  badgeData: any;
}) {
  const theme = useColorTheme();
  const tabData = useTabMetadata(tab.slug, tab);
  const { sessionToken } = useUser();
  const { sidebarRef, desktopCollapsed } = useSidebarContext();

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

  const [isClosedAnimation, setIsClosedAnimation] = React.useState(false);
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

  const tabIcon = useMemo(
    () => (
      <Avatar
        disabled
        size={tab.collection ? 23 : undefined}
        style={{
          backgroundColor: tab.collection ? theme[5] : "transparent",
          marginLeft: tab.collection ? -23 : 0,
          marginBottom: tab.collection ? -10 : 0,
          borderRadius: 10,
        }}
        iconProps={{
          size: tab.collection ? 17 : 24,
          filled: selected,
          style: { marginTop: -1 },
        }}
        icon={
          typeof tabData?.icon === "function"
            ? tabData?.icon?.(tab.params)
            : tabData?.icon
        }
      />
    ),
    [selected, tab, tabData, theme]
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
        {(tab.collection || tab.label) && (
          <Avatar
            disabled
            style={{
              backgroundColor: "transparent",
              marginTop: tab.collection ? -10 : 0,
              shadowRadius: 0,
              borderRadius: 0,
            }}
            size={23}
          >
            <Emoji
              size={23}
              emoji={tab.collection?.emoji || tab.label?.emoji}
            />
          </Avatar>
        )}
        {tabIcon}
        <View style={{ flex: 1 }}>
          <Text weight={400} numberOfLines={1} style={{ color: theme[11] }}>
            {tabName}
          </Text>
          {tabData.name(tab.params, tab.slug)[1] && (
            <Text
              style={[styles.text, { color: theme[11] }]}
              numberOfLines={1}
              weight={400}
            >
              {capitalizeFirstLetter(
                tabData.name(tab.params, tab.slug)[1] || ""
              )}
            </Text>
          )}
        </View>
        {badgeData &&
          !selected &&
          badgeData.collections.find((t) => t.id === tab.collectionId) && (
            <View
              style={{
                width: 10,
                height: 10,
                marginRight: 5,
                borderRadius: 5,
                backgroundColor: theme[9],
              }}
            />
          )}
        {closeIcon}
      </>
    ),
    [tab, tabData, theme, tabName, tabIcon, closeIcon, badgeData, selected]
  );

  const handlePress = useCallback(() => {
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
        onLongPress={onLongPress}
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

export default React.memo(Tab);

