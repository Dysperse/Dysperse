import { useHotkeys } from "@/helpers/useHotKeys";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useTabParams } from "@/utils/useTabParams";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { memo, useEffect } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
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
  const { tab }: { tab: string } = useTabParams() as any;

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
    if (tab && Array.isArray(data)) {
      const index = data?.findIndex((i) => i.id === tab);
      if (index !== -1) {
        const recentlyAccessed = JSON.stringify(data[index]);
        AsyncStorage.setItem("recentlyAccessed", recentlyAccessed);
      }
    }
  }, [tab, data]);

  useHotkeys("ctrl+tab", (e) => {
    e.preventDefault();
    const i = data.findIndex((i) => i.id === tab);
    let d = i + 1;
    if (d >= data.length || i === -1) d = 0;
    handleSnapToIndex(d);
  });

  useHotkeys("ctrl+shift+tab", (e) => {
    e.preventDefault();
    const i = data.findIndex((i) => i.id === tab);
    let d = i - 1;
    if (i === 0) d = data.length - 1;
    handleSnapToIndex(d);
  });

  useHotkeys(
    Array(9)
      .fill(0)
      .map((_, index) => "ctrl+" + (index + 1)),
    (keyboardEvent, hotKeysEvent) => {
      keyboardEvent.preventDefault();
      const i = hotKeysEvent.keys[0];
      if (i == "9") return handleSnapToIndex(data.length - 1);
      if (data[i]) handleSnapToIndex(parseInt(i) - 1);
    }
  );

  const theme = useColorTheme();
  return data && Array.isArray(data) ? (
    <View
      style={{
        flex: 1,
        padding: 15,
        paddingTop: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <Header />
      <FlatList
        aria-label="Sidebar"
        data={data}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: theme[2],
              padding: 1,
            }}
          >
            <Tab tab={item} selected={tab === item.id} />
          </View>
        )}
        style={{ backgroundColor: theme[2] }}
        contentContainerStyle={{ backgroundColor: theme[2] }}
        keyExtractor={(item) => item.id}
      />
    </View>
  ) : (
    <View style={{ alignItems: "center" }}>
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  );
});

export default memo(OpenTabsList);
