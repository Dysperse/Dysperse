import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { useTabParams } from "@/utils/useTabParams";
import { router } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useTabMetadata } from "./useTabMetadata";

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    flexDirection: "row",
    columnGap: 10,
  },
  text: { marginTop: -3, fontSize: 12, opacity: 0.6 },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "transparent",
  },
  closeIcon: { opacity: 0.6 },
});

function Tab({
  tab,
  disabled = false,
  isList = false,
  selected = false,
  handleClose = () => {},
  onLongPress = () => {},
}: {
  tab: any;
  disabled?: boolean;
  isList?: boolean;
  selected?: boolean;
  handleClose?: () => void;
  onLongPress?: () => void;
}) {
  const theme = useColorTheme();
  const tabData = useTabMetadata(tab.slug, tab);
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
              ...(typeof lastTab.params === "object" && lastTab.params),
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

  const tabParams = useTabParams();

  useEffect(() => {
    if (selected) {
      if (
        JSON.stringify(omit(["tab"], tabParams)) !==
        JSON.stringify(omit(["tab"], tab.params))
      ) {
        mutate(
          (oldData) =>
            oldData.map((oldTab) =>
              oldTab.id === tab.id ? { ...oldTab, params: tabParams } : oldTab
            ),
          {
            revalidate: false,
          }
        );
        sendApiRequest(
          sessionToken,
          "PUT",
          "user/tabs",
          {},
          {
            body: JSON.stringify({
              params: omit(["tab"], tabParams),
              id: tab.id,
            }),
          }
        );
      }
    }
  }, [tabParams, selected, tab, sessionToken, mutate]);

  return isClosedAnimation ? null : (
    <View
      style={{
        width: "100%",
      }}
    >
      <Pressable
        onLongPress={onLongPress}
        disabled={disabled}
        onPress={() => {
          router.replace({
            pathname: tab.slug,
            params: {
              ...tab.params,
              tab: tab.id,
            },
          });
          setImmediate(handleClose);
        }}
        style={({ pressed, hovered }: any) => [
          styles.button,
          {
            paddingHorizontal: isList ? 13 : breakpoints.md ? 10 : 10,
            paddingRight: selected ? 30 : undefined,
            borderRadius: 20,
            height: breakpoints.md ? 50 : 50,
            backgroundColor:
              theme[selected ? 5 : pressed ? 5 : hovered ? 4 : 2],
            ...(Platform.OS === "web" &&
              selected && {
                shadowColor: theme[1],
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowRadius: 2,
                shadowOpacity: 1,
              }),
          },
        ]}
      >
        {(tab.collection || tab.label) && (
          <Avatar
            disabled
            style={{
              backgroundColor: "transparent",
              marginTop: tab.collection ? -10 : 0,
            }}
            size={23}
          >
            <Emoji
              size={23}
              emoji={tab.collection?.emoji || tab.label?.emoji}
            />
          </Avatar>
        )}
        <Avatar
          disabled
          size={tab.collection || tab.label ? 23 : undefined}
          style={{
            backgroundColor:
              tab.collection || tab.label
                ? theme[selected ? 7 : 5]
                : "transparent",
            marginLeft: tab.collection || tab.label ? -23 : 0,
            marginBottom: tab.collection || tab.label ? -10 : 0,
          }}
          iconProps={{ size: tab.collection || tab.label ? 20 : 24 }}
          icon={
            typeof tabData.icon === "function"
              ? tabData.icon(tab.params)
              : tabData.icon
          }
        />
        <View style={{ flex: 1 }}>
          <Text weight={500} numberOfLines={1}>
            {capitalizeFirstLetter(
              tab.collection?.name ||
                tab.label?.name ||
                tab.profile?.name ||
                tabData.name(tab.params, tab.slug)[0] ||
                ""
            )}
          </Text>
          {tabData.name(tab.params, tab.slug)[1] && (
            <Text style={[styles.text]} numberOfLines={1} weight={300}>
              {capitalizeFirstLetter(
                tabData.name(tab.params, tab.slug)[1] || ""
              )}
            </Text>
          )}
        </View>
        {breakpoints.lg && (
          <IconButton
            // disabled={!selected}
            style={({ hovered }: any) => [
              styles.closeButton,
              { opacity: hovered ? 1 : 0 },
            ]}
            size={50}
            onPress={async () => await handleDelete(tab.id)}
          >
            <Icon size={23} style={[styles.closeIcon]}>
              close
            </Icon>
          </IconButton>
        )}
      </Pressable>
    </View>
  );
}

export default React.memo(Tab);
