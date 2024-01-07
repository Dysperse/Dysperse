import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useGlobalSearchParams } from "expo-router";
import React, { memo, useEffect } from "react";
import { Platform, ScrollView, View, useWindowDimensions } from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import Tab from "./tab";

const Header = memo(function Header() {
  return (
    <Text
      variant="eyebrow"
      style={{ marginVertical: 10, marginLeft: 5, marginTop: 15 }}
    >
      Tabs
    </Text>
  );
});

const OpenTabsList = memo(function OpenTabsList() {
  const { tab } = useGlobalSearchParams();
  const { width } = useWindowDimensions();
  const ref = React.useRef<ICarouselInstance>(null);

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
  }, [tab, data]);

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
        <Header />
        <ScrollView
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1, width: "100%" }}
        >
          {data.map((t) => (
            <Tab tab={t} key={t.id} selected={tab === t.id} />
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
          padding: 5,
        }}
        data={data}
        pagingEnabled
        onSnapToItem={handleSnapToIndex}
        renderItem={({ item }) => (
          <View key={item.id} style={{ padding: 5, paddingHorizontal: 2.5 }}>
            <Tab key={item.id} tab={item} selected={tab === item.id} />
          </View>
        )}
      />
    )
  ) : (
    <View style={{ alignItems: "center" }}>
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  );
});

export default OpenTabsList;
