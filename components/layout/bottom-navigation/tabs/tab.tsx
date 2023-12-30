import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import dayjs from "dayjs";
import { router, useGlobalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const useTabColorTheme = (slug: string) => {
  const startWithMatchers = {
    "/[tab]/perspectives/": {
      icon: "asterisk",
      name: (params) => [
        params.type,
        `${dayjs(params.start).startOf(params.type).format("MMM Do")} - ${dayjs(
          params.start
        )
          .startOf(params.type)
          .add(1, params.type)
          .format("Do")}`,
      ],
    },
    "/[tab]/collections/": {
      icon: "draw_abstract",
      name: () => [],
    },
    "/[tab]/all/": {
      icon: "nest_true_radiant",
      name: (params, slug) => [slug.split("/all/")[1]],
    },
    "/[tab]/spaces/": {
      icon: "tag",
      name: (params) => ["Space"],
    },
    "/[tab]/users/": {
      icon: "alternate_email",
      name: (params, slug) => [params.id],
    },
  };

  const match = Object.keys(startWithMatchers).find((key) =>
    slug.startsWith(key)
  );
  if (!startWithMatchers[match]) return { icon: "square" };
  return startWithMatchers[match];
};

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
  const tabData = useTabColorTheme(tab.slug);

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

  return (
    <View
      style={{
        padding: isList ? 0 : 6,
        paddingBottom: 0,
        paddingHorizontal: isList ? 0 : 3,
        flex: 1,
        width: "100%",
        opacity: isClosedAnimation ? 0.5 : 1,
        height: width > 600 ? 53.5 : isList ? 55 : 50,
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
          paddingHorizontal: isList ? 6 : 10,
          columnGap: 5,
          borderRadius: 999,
          height: "100%",
          alignItems: "center",
          flexDirection: "row",
          backgroundColor:
            params.tab === tab.id
              ? theme[11]
              : pressed
              ? theme[5]
              : hovered
              ? theme[4]
              : addHslAlpha(theme[3], 0.7),
        })}
      >
        <Icon
          size={tabData.icon === "alternate_email" ? 24 : 30}
          style={{
            ...(tabData.icon === "alternate_email" && {
              lineHeight: 27,
            }),
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
              ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
              ...(params.tab === tab.id && {
                color: theme[3],
              }),
            }}
            weight={600}
            numberOfLines={1}
          >
            {capitalizeFirstLetter(tabData.name(tab.params, tab.slug)[0] || "")}
          </Text>
          {tabData.name(tab.params, tab.slug)[1] && (
            <Text
              style={{
                fontSize: 12,
                opacity: 0.6,
                ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
                ...(params.tab === tab.id && {
                  color: theme[3],
                }),
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
            marginHorizontal: 5,
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
