import { ArcSystemBar } from "@/components/layout/arcAnimations";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { hslToHex } from "@/helpers/hslToHex";
import {
  createSortablePayloadByIndex,
  getBetweenRankAsc,
} from "@/helpers/lexorank";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { Avatar } from "@/ui/Avatar";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
  useReorderableDrag,
} from "react-native-reorderable-list";
import useSWR from "swr";
import { HOME_PATTERNS, MenuButton } from ".";
import { WIDGET_LIST } from "./add-widget";

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

function Widget({ section, handleDelete, iconStyles }) {
  const drag = useReorderableDrag();
  const theme = useColorTheme();

  return (
    <ListItemButton
      key={section.name}
      onLongPress={Platform.OS !== "web" && !section.disabled && drag}
      pressableStyle={{
        paddingVertical: 5,
        opacity: section.disabled ? 0.5 : 1,
      }}
    >
      <Avatar
        image={section.icon.startsWith("https") ? section.icon : undefined}
        icon={
          section.icon.startsWith("https") ? undefined : (section.icon as any)
        }
        style={iconStyles}
        disabled
      />
      <ListItemText
        primaryProps={{ style: { color: theme[11] } }}
        primary={section.name}
      />
      {section.order && (
        <View style={{ flexDirection: "row" }}>
          <IconButton
            icon="remove_circle"
            onPress={() => handleDelete(section.id)}
          />
          {Platform.OS !== "web" && (
            <IconButton onLongPress={drag} icon="drag_indicator" />
          )}
        </View>
      )}
    </ListItemButton>
  );
}

function Widgets() {
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const { data, mutate } = useSWR(["user/focus-panel"]);
  const iconStyles = { backgroundColor: theme[3], borderRadius: 10 };

  const handleWidgetDelete = async (id) => {
    mutate((o) => o.filter((e) => e.id !== id), { revalidate: false });
    await sendApiRequest(sessionToken, "DELETE", "user/focus-panel", { id });
  };

  const sections = [
    ...(Array.isArray(data)
      ? data
          .map((t) => {
            const widget = WIDGET_LIST.find((l) =>
              l.widgets.find((w) => w.key == t.type)
            )?.widgets.find((w) => w.key == t.type);
            // if (!widget) return null;
            return {
              id: t.id,
              name: widget?.text,
              icon: widget?.icon || "square",
              disabled: false,
              order: t.order,
            };
          })
          .filter(Boolean)
      : // .sort((a, b) => {
        //   if (!a.order || !b.order) return 0;
        //   return LexoRank.parse(a.order).compareTo(LexoRank.parse(b.order));
        // })
        []),
  ];

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    mutate(
      (oldItems) => {
        // 1. find prev, current, next items
        const sortablePayload = createSortablePayloadByIndex(oldItems, {
          fromIndex: from,
          toIndex: to,
        });
        // 2. calculate new rank
        const newRank = getBetweenRankAsc(sortablePayload);
        const newItems = [...oldItems];
        const currIndex = oldItems.findIndex(
          (x) => x.id === sortablePayload.entity.id
        );
        // 3. replace current rank
        newItems[currIndex] = {
          ...newItems[currIndex],
          order: newRank.toString(),
        };
        // 4. update server with tab's new rank
        sendApiRequest(
          sessionToken,
          "PUT",
          "user/focus-panel",
          {},
          {
            body: JSON.stringify({
              id: sortablePayload.entity.id,
              order: newRank.toString(),
            }),
          }
        );
        // 5. sort by rank
        return reorderItems(oldItems, from, to);
      },
      { revalidate: false }
    );
  };

  return (
    <View style={{ marginHorizontal: -15 }}>
      <ListItemButton
        pressableStyle={{
          paddingVertical: 5,
          opacity: 0.5,
        }}
      >
        <Avatar icon="change_history" style={iconStyles} disabled />
        <ListItemText
          primaryProps={{ style: { color: theme[11] } }}
          primary="Start"
        />
      </ListItemButton>
      <ListItemButton
        pressableStyle={{
          paddingVertical: 5,
          opacity: 0.5,
        }}
      >
        <Avatar icon="flag" style={iconStyles} disabled />
        <ListItemText
          primaryProps={{ style: { color: theme[11] } }}
          primary="Goals"
        />
      </ListItemButton>
      <ReorderableList
        bounces={false}
        scrollEnabled={false}
        onReorder={handleReorder}
        data={sections}
        renderItem={({ item }) => (
          <Widget
            handleDelete={handleWidgetDelete}
            iconStyles={iconStyles}
            section={item}
          />
        )}
        keyExtractor={(item, index) => item.id + index}
      />
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
  const breakpoints = useResponsiveBreakpoints();

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
    <>
      <MenuButton gradient back />
      <ScrollView>
        <ArcSystemBar />
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
              marginBottom: 40,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: breakpoints.md ? "20%" : "33.333%",
                aspectRatio: 1,
                padding: 5,
              }}
            >
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
              <View
                key={index}
                style={{
                  width: breakpoints.md ? "20%" : "33.333%",
                  aspectRatio: 1,
                  padding: 5,
                }}
              >
                <Pressable
                  onPress={() => handlePatternSelect(pattern)}
                  style={[
                    styles.card,
                    {
                      borderColor: theme[selectedPattern === pattern ? 11 : 5],
                    },
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
    </>
  );
}

