import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { addHslAlpha, useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router, useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import {
  Platform,
  Pressable,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

export function Tab({
  tab,
  disabled = false,
  isList = false,
  handleClose = () => {},
  onLongPress = () => {},
}: {
  tab: any;
  disabled?: boolean;
  isList?: boolean;
  handleClose?: () => void;
  onLongPress?: () => void;
}) {
  const params = useGlobalSearchParams();
  const theme = useColorTheme();
  const redPalette = useColor("red", useColorScheme() === "dark");
  const purplePalette = useColor("purple", useColorScheme() === "dark");
  const greenPalette = useColor("green", useColorScheme() === "dark");
  const colors = { redPalette, purplePalette, greenPalette }[
    tab.slug.includes("collections")
      ? "purplePalette"
      : tab.slug.includes("all")
      ? "greenPalette"
      : "redPalette"
  ];

  const { width } = useWindowDimensions();
  const { sessionToken } = useUser();
  const { data, mutate } = useSWR(["user/tabs"]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setIsClosedAnimation(true);
        // get last tab
        const tab = data.findIndex((tab: any) => tab.id === id);
        const lastTab = data[tab - 1] || data[tab + 1];
        if (lastTab) {
          router.replace({
            params: {
              tab: lastTab.id,
              ...lastTab.params,
            },
            pathname: lastTab.slug,
          });
        }
        sendApiRequest(sessionToken, "DELETE", "user/tabs", {
          id,
        }).then(() => mutate());
      } catch (err) {
        setIsClosedAnimation(false);
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later.",
        });
        console.log(err);
      }
    },
    [mutate, sessionToken, data]
  );

  const [isClosedAnimation, setIsClosedAnimation] = React.useState(false);

  return (
    <View
      style={{
        padding: isList ? 0 : 6,
        paddingBottom: 0,
        paddingHorizontal: isList ? 0 : 3,
        flex: 1,
        width: "100%",
        opacity: isClosedAnimation ? 0.5 : 1,
        height: width > 600 ? 53.5 : 50,
        marginHorizontal: "auto",
        ...(Platform.OS === "web" &&
          ({
            width: "200px",
            flexDirection: "row",
            alignItems: "center",
          } as object)),
      }}
    >
      <Pressable
        onLongPress={onLongPress}
        disabled={disabled}
        onPress={() => {
          router.replace(tab.slug);
          router.replace({
            pathname: tab.slug,
            params: {
              ...tab.params,
              tab: tab.id,
            },
          });
          handleClose();
        }}
        style={({ pressed, hovered }: any) => ({
          flex: 1,
          paddingHorizontal: isList ? 6 : 15,
          columnGap: 5,
          borderRadius: 20,
          height: "100%",
          alignItems: "center",
          flexDirection: "row",
          ...(width > 600
            ? {
                backgroundColor:
                  params.tab === tab.id
                    ? theme[pressed ? 6 : hovered ? 5 : 4]
                    : pressed
                    ? theme[5]
                    : hovered
                    ? theme[4]
                    : addHslAlpha(theme[3], 0.7),
              }
            : {
                backgroundColor: isList
                  ? "transparent"
                  : theme[
                      params.tab === tab.id ? 5 : pressed ? 4 : hovered ? 3 : 3
                    ],
              }),
        })}
      >
        <LinearGradient
          colors={[colors[6], colors[7]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 10,
            width: 30,
            height: 30,
            alignItems: "center",
            marginRight: 5,
            justifyContent: "center",
          }}
        >
          <Icon size={24} style={{ color: colors[12] }}>
            pageview
          </Icon>
        </LinearGradient>
        <Text
          style={{
            ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
          }}
          numberOfLines={1}
        >
          {tab.slug}
        </Text>
        <IconButton
          style={{
            marginLeft: "auto",
            width: 20,
            height: 20,
            display:
              width < 600
                ? isList
                  ? "flex"
                  : "none"
                : params.tab === tab.id
                ? "flex"
                : "none",
          }}
          onPress={async () => {
            await handleDelete(tab.id);
          }}
        >
          <Icon size={23} style={{ color: theme[11], opacity: 0.6 }}>
            {width > 600 ? "close" : "remove_circle"}
          </Icon>
        </IconButton>
      </Pressable>
    </View>
  );
}
