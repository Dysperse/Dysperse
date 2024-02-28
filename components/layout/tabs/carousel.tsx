import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useHotkeys } from "@/helpers/useHotKeys";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useTabParams } from "@/utils/useTabParams";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { memo, useEffect } from "react";
import { Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import Tab from "./tab";

const JumpToButton = memo(function JumpToButton() {
  const theme = useColorTheme();

  const { handleOpen } = useCommandPaletteContext();
  useHotkeys(["ctrl+k", "ctrl+o"], (e) => {
    e.preventDefault();
    handleOpen();
  });

  useHotkeys(["ctrl+/"], (e) => {
    e.preventDefault();
    router.push("/shortcuts");
  });

  return (
    <Pressable
      onPress={handleOpen}
      style={({ pressed, hovered }) => [
        {
          backgroundColor: theme[pressed ? 4 : hovered ? 3 : 2],
          opacity: pressed ? 0.5 : 1,
          flexDirection: "row",
          alignItems: "center",
          columnGap: 15,
          paddingHorizontal: 15,
          borderRadius: 15,
          height: 50,
          marginBottom: 10,
        },
      ]}
    >
      <Icon bold>add</Icon>
      <Text weight={700} style={{ color: theme[11] }}>
        New tab
      </Text>
    </Pressable>
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
  return data && Array.isArray(data) && data.length > 0 ? (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 15,
        width: "100%",
        // backgroundColor: "red",
        marginBottom: -20,
        height: "100%",
      }}
    >
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
      <JumpToButton />
    </View>
  ) : (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      {error ? (
        <ErrorAlert />
      ) : data && data.length === 0 ? (
        <View style={{ alignItems: "center", padding: 20 }}>
          <Text variant="eyebrow" style={{ marginTop: 10, fontSize: 13.5 }}>
            It's quiet here...
          </Text>
          <Text
            style={{
              color: theme[11],
              opacity: 0.5,
              textAlign: "center",
              fontSize: 13,
              marginTop: 5,
            }}
          >
            Try opening a collection or label
          </Text>
        </View>
      ) : (
        <Spinner />
      )}
    </View>
  );
});

export default memo(OpenTabsList);
