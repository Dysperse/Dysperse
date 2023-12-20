import { window } from "@/constants";
import { useOpenTab } from "@/context/tabs";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { Tab } from "./tab";

const PAGE_WIDTH = window.width;

export function OpenTabsList() {
  const theme = useColorTheme();
  const { session } = useUser();
  const ref = React.useRef<ICarouselInstance>(null);
  const { activeTab, setActiveTab } = useOpenTab();
  const pathname = usePathname();

  const baseOptions = {
    vertical: false,
    width: PAGE_WIDTH * 0.8,
  } as const;

  const handleSnapToIndex = (index: number) => {
    const tabs = session.user.tabs;
    const tab = tabs[index];
    if (tab) {
      router.replace(tab.tabData.href);
    }
  };

  useEffect(() => {
    if (!session) return;
    if (Platform.OS === "web") {
      return;
    }
    if (pathname !== "/") {
      const index = session.user.tabs.findIndex(
        (tab) => tab.tabData.href === pathname
      );
      if (index !== -1) {
        ref.current.scrollTo({ index, animated: true });
      }
    }
  }, [pathname, session]);

  useEffect(() => {
    const id = session?.user?.tabs?.findIndex((i) => i.id === activeTab);
    if (session && ref?.current && id) {
      ref.current.scrollTo(id);
    }
  }, [session, activeTab]);

  const { width } = useWindowDimensions();

  useEffect(() => {
    if (width < 600) {
      const tab = session.user.tabs.find((i) => i.tabData.href === pathname);
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, [session, pathname, width, setActiveTab]);

  return session ? (
    Platform.OS === "web" ? (
      <View
        style={{
          height: 64,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            paddingTop: 8,
            paddingRight: 3,
            shadowColor: "red",
          }}
        >
          <IconButton
            style={({ pressed, hovered }) => ({
              backgroundColor:
                pathname === "/"
                  ? theme[pressed ? 4 : 3]
                  : hovered
                  ? theme[3]
                  : addHslAlpha(theme[3], 0.7),
              width: 46,
              height: 46,
              borderRadius: 20,
            })}
            onPress={() => {
              router.replace("/");
              setActiveTab("");
            }}
          >
            <Icon filled={pathname === "/"}>home</Icon>
          </IconButton>
        </View>
        <LinearGradient
          colors={[theme[2], "transparent"]}
          style={{ width: 17, marginRight: -17, marginLeft: -3, zIndex: 99 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            height: 64,
            flexDirection: "row",
            paddingRight: 20,
            paddingLeft: 10,
            paddingTop: 1.5,
          }}
          contentContainerStyle={{ paddingRight: 3 }}
        >
          {session.user.tabs.map((tab) => (
            <Tab tab={tab} key={tab.id} />
          ))}
        </ScrollView>
        <LinearGradient
          colors={["transparent", theme[2]]}
          style={{ width: 30, marginLeft: -30, zIndex: 99 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    ) : (
      <View style={{ flex: 1 }}>
        <Carousel
          {...baseOptions}
          loop={false}
          ref={ref}
          style={{
            width: "100%",
            justifyContent: "center",
            height: 53,
          }}
          data={session.user.tabs}
          pagingEnabled
          onSnapToItem={handleSnapToIndex}
          renderItem={({ index }) => (
            <Tab
              tab={session.user.tabs[index]}
              key={session.user.tabs[index].id}
            />
          )}
        />
      </View>
    )
  ) : (
    <View>
      <ActivityIndicator />
    </View>
  );
}
