import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Platform, ScrollView, View, useWindowDimensions } from "react-native";
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
  const { tab } = useGlobalSearchParams();

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
    if (tab && tab.slug !== pathname) {
      router.replace({
        pathname: tab.slug,
        params: {
          tab: tab.id,
          ...(typeof tab.params === "object" && tab.params),
        },
      });
    }
  };

  useEffect(() => {
    if (data && Platform.OS !== "web") {
      const index = data.findIndex((i) => i.id === tab);
      if (ref.current.getCurrentIndex() !== index)
        ref.current.scrollTo({ index, animated: true });
    }
  }, [data, tab]);

  useEffect(() => {
    if (tab) {
      const index = data?.findIndex((i) => i.id === tab);
      if (index !== -1) {
        const recentlyAccessed = JSON.stringify(data[index]);
        AsyncStorage.setItem("recentlyAccessed", recentlyAccessed);
      }
    }
  }, [pathname, tab, data]);

  return data && Array.isArray(data) ? (
    width > 600 ? (
      <View
        style={{
          flex: 1,
          padding: 15,
          paddingTop: 0,
          width: "100%",
        }}
      >
        <Text
          variant="eyebrow"
          style={{ marginVertical: 10, marginLeft: 5, marginTop: 15 }}
        >
          Tabs
        </Text>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={{ gap: 5 }}
        >
          {data.map((tab) => (
            <Tab tab={tab} key={tab.id} />
          ))}
        </ScrollView>
      </View>
    ) : (
      <Carousel
        loop={false}
        {...baseOptions}
        enabled={Platform.OS !== "web"}
        ref={ref}
        style={{
          width: "100%",
          justifyContent: "center",
          height: 65,
        }}
        data={data}
        pagingEnabled
        onSnapToItem={handleSnapToIndex}
        renderItem={({ index }) => (
          <View key={data[index].id} style={{ padding: 5 }}>
            <Tab tab={data[index]} />
          </View>
        )}
      />
    )
  ) : (
    <View style={{ alignItems: "center" }}>
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  );
}
