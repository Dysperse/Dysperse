import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Platform, ScrollView, View, useWindowDimensions } from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { Tab } from "./tab";
import Text from "@/ui/Text";

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
          flex: 1,
          padding: 15,
          width: "100%",
        }}
      >
        <IconButton
          style={({ pressed, hovered }) => ({
            borderWidth: 1,
            borderColor: theme[5],
            backgroundColor:
              pathname === "/"
                ? theme[pressed ? 12 : 11]
                : hovered
                ? theme[3]
                : addHslAlpha(theme[3], 0.7),
            borderRadius: 999,
          })}
          size={47}
          onPress={() => {
            router.replace("/");
          }}
        >
          <Logo color={theme[pathname === "/" ? 3 : 11]} size={26} />
        </IconButton>
        <Text
          variant="eyebrow"
          style={{ marginVertical: 10, marginLeft: 5, marginTop: 20 }}
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
          <Tab tab={data[index]} key={data[index].id} />
        )}
      />
    )
  ) : (
    <View style={{ alignItems: "center" }}>
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  );
}
