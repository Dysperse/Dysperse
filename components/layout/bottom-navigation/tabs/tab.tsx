import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { router, useGlobalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useTabMetadata } from "./useTabMetadata";

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
  const tabData = useTabMetadata(tab.slug);

  const { width } = useWindowDimensions();
  const { sessionToken } = useUser();
  const { data, error, mutate } = useSWR(["user/tabs"]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        if (error || !data) {
          return Toast.show({
            type: "error",
            text1: "Couldn't load tabs. Please try again later.",
          });
        }
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
    [mutate, sessionToken, data, error]
  );

  const [isClosedAnimation, setIsClosedAnimation] = React.useState(false);
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        width: "100%",
        opacity: isClosedAnimation ? 0.5 : 1,
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
          setImmediate(handleClose);
        }}
        style={({ pressed, hovered }: any) => ({
          paddingHorizontal: isList
            ? breakpoints.lg
              ? 6
              : 13
            : breakpoints.lg
            ? 6
            : 10,
          borderRadius: breakpoints.lg ? 15 : 99,
          height: breakpoints.lg ? 40 : 60,
          alignItems: "center",
          flexDirection: "row",
          columnGap: 5,
          borderWidth: 1,
          backgroundColor:
            theme[
              params.tab === tab.id
                ? 11
                : pressed
                ? 5
                : hovered
                ? 4
                : breakpoints.lg
                ? 2
                : 3
            ],
          borderColor:
            theme[params.tab === tab.id ? 11 : breakpoints.lg ? 2 : 5],
        })}
      >
        <Icon
          size={tabData.icon === "alternate_email" ? 26 : 30}
          style={{
            ...(params.tab === tab.id && {
              color: theme[3],
            }),
          }}
        >
          {tabData.icon}
        </Icon>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme[params.tab === tab.id ? 3 : 11],
              ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
            }}
            weight={500}
            numberOfLines={1}
          >
            {capitalizeFirstLetter(tabData.name(tab.params, tab.slug)[0] || "")}
          </Text>
          {tabData.name(tab.params, tab.slug)[1] && (
            <Text
              style={{
                marginTop: -3,
                fontSize: 12,
                opacity: 0.6,
                color: theme[params.tab === tab.id ? 3 : 11],
                ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
              }}
              numberOfLines={1}
            >
              {capitalizeFirstLetter(
                tabData.name(tab.params, tab.slug)[1] || ""
              )}
            </Text>
          )}
        </View>
        <IconButton
          style={{
            width: width > 600 ? 20 : 40,
            height: width > 600 ? 20 : 40,
            marginRight: 5,
            backgroundColor: "transparent",
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
          <Icon
            size={23}
            style={{
              color: theme[3],
              opacity: 0.6,
            }}
          >
            close
          </Icon>
        </IconButton>
      </Pressable>
    </View>
  );
}
