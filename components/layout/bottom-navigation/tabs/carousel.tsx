import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
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
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { Tab } from "./tab";

export function OpenTabsList() {
  const { width } = useWindowDimensions();
  const theme = useColorTheme();
  const ref = React.useRef<ICarouselInstance>(null);
  const pathname = usePathname();

  const baseOptions = {
    vertical: false,
    width: width * 0.8,
  } as const;

  const { data, error } = useSWR(["user/tabs"]);

  const handleSnapToIndex = (index: number) => {
    if (error)
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    if (!data) return;
    const tab = data[index];
    if (tab) {
      router.replace({
        pathname: tab.slug,
        params: {
          tab: tab.id,
          ...(typeof tab.params === "object" && tab.params),
        },
      });
    }
  };

  const { tab } = useGlobalSearchParams();

  useEffect(() => {
    if (data && Platform.OS !== "web") {
      const index = data.findIndex((i) => i.id === tab);
      if (ref.current.getCurrentIndex() !== index)
        ref.current.scrollTo({ index, animated: true });
    }
  }, [data, tab]);

  return data && Array.isArray(data) ? (
    width > 600 ? (
      <View
        style={{
          height: 64,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            justifyContent: "center",
            paddingRight: 3,
          }}
        >
          <IconButton
            style={({ pressed, hovered }) => ({
              backgroundColor:
                pathname === "/"
                  ? theme[pressed ? 12 : 11]
                  : hovered
                  ? theme[3]
                  : addHslAlpha(theme[3], 0.7),
              width: 46,
              height: 46,
              borderRadius: 999,
            })}
            onPress={() => {
              router.replace("/");
            }}
          >
            <Icon
              style={{ color: theme[pathname === "/" ? 3 : 11] }}
              filled={pathname === "/"}
            >
              home
            </Icon>
          </IconButton>
        </View>
        <LinearGradient
          colors={[theme[1], "transparent"]}
          style={{ width: 17, marginRight: -17, zIndex: 99 }}
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
            paddingLeft: 5,
            paddingTop: 1.5,
          }}
          contentContainerStyle={{ paddingRight: 3 }}
        >
          {data.map((tab) => (
            <Tab tab={tab} key={tab.id} />
          ))}
        </ScrollView>
        <LinearGradient
          colors={["transparent", theme[1]]}
          style={{ width: 30, marginLeft: -30, zIndex: 99 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View
          style={{
            justifyContent: "center",
            marginRight: 15,
            paddingLeft: 10,
          }}
        >
          {/* <SpacesTrigger /> */}
        </View>
      </View>
    ) : (
      <Carousel
        {...baseOptions}
        enabled={Platform.OS !== "web"}
        ref={ref}
        style={{
          width: "100%",
          justifyContent: "center",
          height: 55,
        }}
        data={data}
        pagingEnabled
        onSnapToItem={handleSnapToIndex}
        renderItem={({ index }) => (
          <Tab tab={data[index]} key={data[index].id} />
        )}
      />
    )
  ) : (
    <View>
      <ActivityIndicator />
    </View>
  );
}
