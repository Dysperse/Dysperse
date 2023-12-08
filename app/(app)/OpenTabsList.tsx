import { window } from "@/constants";
import { useUser } from "@/context/useUser";
import { useColor } from "@/ui/color";
import Icon from "@/ui/icon";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";

const PAGE_WIDTH = window.width;

function Tab({ tab }) {
  const isPerspective = useMemo(
    () => tab.tabData.href.includes("perspectives"),
    [tab.tabData]
  );

  const redPalette = useColor("red", false);

  const colors = isPerspective ? redPalette : redPalette;

  return (
    <View
      style={{
        padding: 6,
        paddingHorizontal: 3,
        flex: 1,
        width: "100%",
        marginHorizontal: "auto",
        ...(Platform.OS === "web" &&
          ({
            width: "200px",
          } as Object)),
      }}
    >
      <Pressable
        onPress={() => alert(JSON.stringify(tab))}
        style={{
          flex: 1,
          paddingHorizontal: 15,
          columnGap: 15,
          borderRadius: 20,
          alignItems: "center",
          flexDirection: "row",
          backgroundColor: "#ddd",
        }}
        className="active:opacity-60"
      >
        <LinearGradient
          colors={[colors[5], colors[7]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 14,
            width: 35,
            height: 35,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={30} style={{ color: colors[11] }}>
            {tab.tabData.icon}
          </Icon>
        </LinearGradient>
        <Text>{tab.tabData.label}</Text>
      </Pressable>
    </View>
  );
}

export function OpenTabsList() {
  const { session } = useUser();
  const ref = React.useRef<ICarouselInstance>(null);

  const baseOptions = {
    vertical: false,
    width: PAGE_WIDTH * 0.8,
  } as const;

  return session ? (
    Platform.OS === "web" ? (
      <ScrollView
        horizontal
        style={{ height: 64, flexDirection: "row", paddingHorizontal: 20 }}
      >
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
            height: 64,
          }}
          data={session.user.tabs}
          pagingEnabled
          onSnapToItem={(index) => console.log("current index:", index)}
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
