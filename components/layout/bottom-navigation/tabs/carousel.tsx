import { window } from "@/constants";
import { useUser } from "@/context/useUser";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, ScrollView, View } from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { Tab } from "./tab";
import { Link, router, usePathname } from "expo-router";
import IconButton from "@/ui/IconButton";
import Icon from "@/ui/Icon";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useOpenTab } from "@/context/tabs";
import { addHslAlpha } from "@/ui/color";

const PAGE_WIDTH = window.width;

export function OpenTabsList() {
  const theme = useColorTheme();
  const { session } = useUser();
  const ref = React.useRef<ICarouselInstance>(null);
  const { setActiveTab } = useOpenTab();
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
    if (pathname === "/") {
    } else {
      const index = session.user.tabs.findIndex(
        (tab) => tab.tabData.href === pathname
      );
      if (index !== -1) {
        ref.current.scrollTo({ index, animated: true });
      }
    }
  }, [pathname, session]);

  return session ? (
    Platform.OS === "web" ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          height: 64,
          flexDirection: "row",
        }}
      >
        <View style={{ paddingTop: 8, paddingRight: 3 }}>
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
        {session.user.tabs.map((tab) => (
          <Tab tab={tab} key={tab.id} />
        ))}
      </ScrollView>
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
