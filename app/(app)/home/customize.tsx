import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { hslToHex } from "@/helpers/hslToHex";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { Avatar } from "@/ui/Avatar";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { HOME_PATTERNS, MenuButton } from ".";

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

function Widgets() {
  const theme = useColorTheme();
  const { data, mutate } = useSWR(["user/focus-panel"]);
  const iconStyles = { backgroundColor: theme[3], borderRadius: 10 };

  const sections = [
    { name: "Start", icon: "change_history" },
    { name: "Goals", icon: "flag" },
    { name: "Recent activity", icon: "group" },
  ];

  return (
    <View style={{ marginHorizontal: -10 }}>
      {JSON.stringify(data)}
      {sections.map((section) => (
        <ListItemButton
          disabled
          key={section.name}
          pressableStyle={{ paddingVertical: 5 }}
        >
          <Avatar icon={section.icon} style={iconStyles} disabled />
          <ListItemText
            primaryProps={{ style: { color: theme[11] } }}
            primary={section.name}
          />
        </ListItemButton>
      ))}
      <ListItemButton
        pressableStyle={{ paddingVertical: 5 }}
        onPress={() => router.push("/home/add-widget")}
      >
        <Avatar icon="add" style={iconStyles} disabled />
        <ListItemText
          primaryProps={{ style: { color: theme[11] } }}
          primary="Add widget..."
        />
      </ListItemButton>
    </View>
  );
}

export default function Page() {
  const theme = useColorTheme();
  const { session, sessionToken, mutate } = useUser();
  const selectedPattern = session?.user?.profile?.pattern || "none";

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  const uriCreator = (pattern) => {
    const hslValues = theme[10]
      .replace("hsl", "")
      .replace("(", "")
      .replace(")", "")
      .replaceAll("%", "")
      .split(",")
      .map(Number) as [number, number, number];

    const params = new URLSearchParams({
      color: `#${hslToHex(...hslValues)}`,
      pattern: pattern,
      screenWidth: "150",
      screenHeight: "150",
      ...(Platform.OS !== "web" && { asPng: "true" }),
    });

    const uri = `${
      process.env.EXPO_PUBLIC_API_URL
    }/pattern?${params.toString()}`;

    return uri;
  };

  const handlePatternSelect = useCallback(
    async (pattern) => {
      mutate(
        (d) => ({
          ...d,
          user: {
            ...d.user,
            profile: {
              ...d.user.profile,
              pattern,
            },
          },
        }),
        {
          revalidate: false,
        }
      );
      await sendApiRequest(
        sessionToken,
        "PUT",
        "user/profile",
        {},
        {
          body: JSON.stringify({
            pattern,
          }),
        }
      );
    },
    [sessionToken, mutate]
  );

  return (
    <ScrollView>
      <SystemBars style="light" />
      <MenuButton gradient back />
      <View style={{ paddingHorizontal: 30 }}>
        <Text
          style={{
            fontFamily: "serifText800",
            color: theme[11],
            fontSize: 35,
            marginTop: 100,
            marginBottom: 5,
          }}
        >
          Widgets
        </Text>
        <Widgets />
        <Text
          style={{
            fontFamily: "serifText800",
            color: theme[11],
            fontSize: 35,
            marginTop: 50,
            marginBottom: 20,
          }}
        >
          Background
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <View style={{ width: "20%", padding: 5 }}>
            <Pressable
              style={[
                styles.card,
                { borderColor: theme[selectedPattern === "none" ? 11 : 5] },
              ]}
              onPress={() => handlePatternSelect("none")}
            >
              <Text weight={900} style={{ opacity: 0.5, color: theme[11] }}>
                None
              </Text>
            </Pressable>
          </View>
          {HOME_PATTERNS.map((pattern, index) => (
            <View key={index} style={{ width: "20%", padding: 5 }}>
              <Pressable
                onPress={() => handlePatternSelect(pattern)}
                style={[
                  styles.card,
                  { borderColor: theme[selectedPattern === pattern ? 11 : 5] },
                ]}
              >
                <Image
                  source={{ uri: uriCreator(pattern) }}
                  style={{ width: "100%", height: "100%", borderRadius: 20 }}
                />
                {selectedPattern === pattern && (
                  <Icon
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      margin: 5,
                    }}
                    filled
                    size={40}
                  >
                    check_circle
                  </Icon>
                )}
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
