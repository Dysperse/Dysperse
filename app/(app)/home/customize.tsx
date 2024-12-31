import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { hslToHex } from "@/helpers/hslToHex";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { HOME_PATTERNS, MenuButton } from ".";

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
});

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
      <Text
        style={{
          fontFamily: "serifText800",
          color: theme[11],
          fontSize: 35,
          textAlign: "center",
          marginTop: 100,
          marginBottom: 20,
        }}
        aria-valuetext="web-blur"
      >
        Customize
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          gap: 15,
        }}
      >
        <Pressable style={[styles.card, { borderColor: theme[5] }]}>
          <Text weight={900} style={{ opacity: 0.5 }}>
            None
          </Text>
        </Pressable>
        {HOME_PATTERNS.map((pattern, index) => (
          <Pressable
            key={index}
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
        ))}
      </View>
    </ScrollView>
  );
}
