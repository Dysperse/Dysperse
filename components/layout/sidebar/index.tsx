import { CreateEntityTrigger } from "@/components/collections/views/CreateEntityTrigger";
import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useFocusPanelContext } from "@/components/focus-panel/context";
import { CreateLabelModal } from "@/components/labels/createModal";
import { SpacePage } from "@/components/space";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { Menu } from "@/ui/Menu";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { router, usePathname } from "expo-router";
import React, { memo, useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Dimensions,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import useSWR, { mutate } from "swr";
import OpenTabsList from "../bottom-navigation/tabs/carousel";

export const styles = StyleSheet.create({
  header: {
    padding: 15,
    paddingBottom: 0,
    paddingTop: 25,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: 7,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  footerContainer: {
    marginTop: "auto",
    padding: 15,
    paddingTop: 0,
  },
  footer: {
    gap: 10,
    paddingTop: 15,
    alignItems: "center",
    flexDirection: "row",
    borderTopWidth: 1,
  },
});

const HomeButton = memo(function HomeButton({ isHome }: { isHome: boolean }) {
  const handleHome = () => router.push("/");
  const theme = useColorTheme();
  useHotkeys("ctrl+0", () => router.push("/"));

  return (
    <Pressable
      onPress={handleHome}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: theme[5],
          backgroundColor: theme[1],
          opacity: pressed ? 0.5 : 1,
        },
      ]}
    >
      <Icon filled={isHome}>home</Icon>
    </Pressable>
  );
});

function Space() {
  const { session } = useUser();
  const { data, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );
  useHotkeys("esc", () => router.back());

  return (
    <>
      {data ? (
        <SpacePage space={data} />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Spinner />
        </View>
      )}
    </>
  );
}

const JumpToButton = memo(function JumpToButton() {
  const theme = useColorTheme();

  const { handleOpen } = useCommandPaletteContext();
  useHotkeys(["ctrl+k", "ctrl+/", "ctrl+o"], (e) => {
    e.preventDefault();
    handleOpen();
  });

  return (
    <Pressable
      onPress={handleOpen}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: theme[5],
          backgroundColor: theme[1],
          opacity: pressed ? 0.5 : 1,
        },
      ]}
    >
      <Icon>electric_bolt</Icon>
      <Text style={{ color: theme[11] }}>Jump to</Text>
    </Pressable>
  );
});

export const LogoButton = memo(function LogoButton({
  toggleHidden,
  isHidden,
}: {
  toggleHidden: (v) => void;
  isHidden: boolean;
}) {
  const theme = useColorTheme();
  const { error } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const red = useColor("red", useColorScheme() === "dark");
  const openSupport = useCallback(() => {
    Linking.openURL("https://blog.dysperse.com");
  }, []);
  const openFeedback = useCallback(() => {
    Linking.openURL("https://feedback.dysperse.com");
  }, []);

  const { isFocused, setFocus } = useFocusPanelContext();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <MenuPopover
        menuProps={{
          rendererProps: {
            placement: "bottom",
            anchorStyle: { opacity: 0 },
          },
        }}
        containerStyle={{ width: 160, marginLeft: 10, marginTop: 5 }}
        trigger={
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingLeft: 3,
            }}
          >
            <Logo size={35} color={theme[8]} />
            <Icon style={{ color: theme[8] }}>expand_more</Icon>
          </Pressable>
        }
        options={[
          {
            renderer: () => (
              <Menu
                height={[Dimensions.get("window").height - 100]}
                width={500}
                trigger={
                  <MenuItem>
                    <Icon>communities</Icon>
                    <Text variant="menuItem">Space</Text>
                  </MenuItem>
                }
              >
                <Space />
              </Menu>
            ),
          },
          {
            icon: "settings",
            text: "Settings",
            callback: () => router.push("/settings"),
          },
          { divider: true, key: "1" },
          {
            icon: "question_mark",
            text: "Help",
            callback: openSupport,
          },
          {
            icon: "feedback",
            text: "Feedback",
            callback: openFeedback,
          },
          {
            icon: "brand_awareness",
            text: "What's new",
            callback: openFeedback,
          },
        ]}
      />
      {error && <Icon style={{ color: red[11] }}>cloud_off</Icon>}
      {breakpoints.md && (
        <MenuPopover
          menuProps={{
            rendererProps: {
              placement: "right",
              anchorStyle: { opacity: 0 },
            },
          }}
          containerStyle={{ marginTop: 10, width: 200 }}
          trigger={
            <IconButton
              size={40}
              onPress={toggleHidden}
              icon="dock_to_right"
              style={{ opacity: 0.9 }}
            />
          }
          options={[
            {
              icon: "dock_to_right",
              text: "Sidebar",
              callback: toggleHidden,
              selected: !isHidden,
            },
            {
              icon: "dock_to_left",
              text: "Focus panel",
              selected: isFocused,
              callback: () => setFocus(!isFocused),
            },
          ]}
        />
      )}
    </View>
  );
});

const QuickCreateButton = memo(function QuickCreateButton() {
  const theme = useColorTheme();
  return (
    <CreateEntityTrigger
      shortcutEnabled
      additional={[
        { divider: true, key: "1" },
        {
          renderer: () => (
            <CreateLabelModal
              mutate={() => mutate(() => true)}
              // onClose={() => searchRef.current.focus()}
            >
              <MenuItem>
                <Icon>label</Icon>
                <Text variant="menuItem">Label</Text>
              </MenuItem>
            </CreateLabelModal>
          ),
        },
        {
          icon: "layers",
          text: "Collection",
          callback: () => router.push("/collections/create"),
        },
      ]}
      menuProps={{
        style: { flex: 1, marginRight: -10 },
      }}
      popoverProps={{
        containerStyle: { marginLeft: 10, width: 200 },
      }}
    >
      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            borderColor: theme[5],
            backgroundColor: theme[1],
            opacity: pressed ? 0.5 : 1,
            flex: 1,
          },
        ]}
      >
        <Icon>note_stack_add</Icon>
        <Text style={{ color: theme[11] }}>New</Text>
      </Pressable>
    </CreateEntityTrigger>
  );
});

const Header = memo(function Header() {
  const isHome = usePathname() === "/";

  return (
    <View
      style={{
        marginTop: 20,
        marginBottom: 10,
        gap: 10,
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
      <JumpToButton />
    </View>
  );
});

function PanelSwipeTrigger({ isHidden }) {
  const theme = useColorTheme();
  const width = useSharedValue(15);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isHidden ? width.value : 15, {
        damping: 30,
        stiffness: 400,
      }),
    };
  });

  const dotStyle = useAnimatedStyle(() => ({
    height: withSpring(width.value === 15 ? 20 : 40, {
      damping: 30,
      stiffness: 400,
    }),
  }));

  const isPullerActive = useSharedValue(0);
  const isPullerHovered = useSharedValue(0);

  const pullerStyles = useAnimatedStyle(() => ({
    width: withSpring(!isPullerActive.value ? 5 : 9, {
      damping: 30,
      stiffness: 400,
    }),
    backgroundColor: withSpring(
      theme[
        !isPullerActive.value
          ? isPullerHovered.value
            ? 5
            : 4
          : isPullerHovered.value
          ? 6
          : 5
      ],
      {
        damping: 30,
        stiffness: 400,
      }
    ),
  }));

  const onPressIn = () => {
    width.value = 25;
    isPullerActive.value = 1;
  };

  const onPressOut = () => {
    width.value = 15;
    isPullerActive.value = 0;
  };

  const onHoverIn = () => {
    isPullerHovered.value = 1;
    width.value = 25;
  };

  const onHoverOut = () => {
    isPullerHovered.value = 0;
    width.value = 15;
  };

  return (
    <Pressable
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{
        height: "100%",
        marginRight: -10,
        zIndex: 999,
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={[animatedStyle, { alignItems: "center", paddingVertical: 20 }]}
      >
        <Animated.View
          style={[
            pullerStyles,
            dotStyle,
            {
              backgroundColor: theme[4],
              width: 5,
              borderRadius: 99,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const theme = useColorTheme();

  const [isHidden, setIsHidden] = useState(
    Platform.OS === "web"
      ? localStorage.getItem("sidebarHidden") === "true"
      : false
  );
  const toggleHidden = useCallback(() => {
    setIsHidden((prev) => !prev);
  }, [setIsHidden]);

  useHotkeys("`", toggleHidden, {}, [isHidden]);
  useHotkeys("ctrl+comma", () => router.push("/settings"));

  const marginLeft = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (isHidden) {
      marginLeft.value = -220;
      if (Platform.OS === "web") localStorage.setItem("sidebarHidden", "true");
    } else {
      marginLeft.value = 0;
      if (Platform.OS === "web") localStorage.setItem("sidebarHidden", "false");
    }
  }, [isHidden, marginLeft, translateX]);

  const marginLeftStyle = useAnimatedStyle(() => ({
    marginLeft: withSpring(marginLeft.value, { damping: 30, stiffness: 400 }),
    pointerEvents: isHidden ? "none" : "auto",
  }));

  const pan = Gesture.Pan()
    .onChange(({ changeX }) => {
      marginLeft.value += Math.min(changeX, 220);
      if (marginLeft.value < -220) {
        marginLeft.value = -220;
      }
      if (marginLeft.value > 0) {
        marginLeft.value = 0;
      }
    })
    .onEnd(({ velocityX }) => {
      marginLeft.value = velocityX > 0 ? -220 : 0;
      setIsHidden(velocityX <= 0);
    });

  const tap = Gesture.Tap().onEnd(toggleHidden);

  console.log(isHidden);

  return (
    <>
      <Animated.View
        style={[
          marginLeftStyle,
          {
            height: "100%",
            width: 220,
            flexDirection: "column",
            maxHeight: "100%",
            backgroundColor: theme[2],
            ...(Platform.OS === "web" &&
              ({
                paddingTop: "env(titlebar-area-height,0)",
              } as any)),
          },
        ]}
      >
        <View style={styles.header}>
          <LogoButton toggleHidden={toggleHidden} isHidden={isHidden} />
          <Header />
        </View>
        <OpenTabsList />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <GestureDetector gesture={tap}>
          <PanelSwipeTrigger isHidden={isHidden} />
        </GestureDetector>
      </GestureDetector>
    </>
  );
}
