import { CreateDrawer } from "@/components/layout/bottom-navigation/create-drawer";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { Menu } from "@/ui/Menu";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import useSWR from "swr";

export const getSidebarItems = async (session) => {
  // const req = await sendApiRequest(session, "GET", "space/tasks/boards", {});

  return [
    {
      title: "Perspectives",
      data: [
        {
          label: "Weeks",
          icon: "calendar_view_week",
          slug: "/[tab]/perspectives/agenda/[type]/[start]",
          params: {
            start: dayjs().format("YYYY-MM-DD"),
            type: "week",
          },
        },
        {
          label: "Months",
          icon: "calendar_view_month",
          slug: "/[tab]/perspectives/agenda/[type]/[start]",
          params: {
            start: dayjs().format("YYYY-MM-DD"),
            type: "month",
          },
        },
        {
          label: "Years",
          icon: "view_compact",
          slug: "/[tab]/perspectives/agenda/[type]/[start]",
          params: {
            start: dayjs().format("YYYY-MM-DD"),
            type: "year",
          },
        },
        {
          label: "Upcoming",
          icon: "calendar_clock",
          slug: "/[tab]/perspectives/upcoming",
        },
        {
          label: "Backlog",
          icon: "event_upcoming",
          slug: "/[tab]/perspectives/backlog",
        },
        {
          label: "Unscheduled",
          icon: "history_toggle_off",
          slug: "/[tab]/perspectives/unscheduled",
        },
        {
          label: "Completed",
          icon: "check_circle",
          slug: "/[tab]/perspectives/completed",
        },
        {
          label: "Difficulty",
          icon: "priority_high",
          slug: "/[tab]/perspectives/difficulty",
        },
      ],
    },
    {
      title: "Collections",
      data: [
        {
          label: "Create",
          icon: "add",
          slug: "/[tab]/collections/create",
        },
        // ...(req && Array.isArray(req)
        //   ? req.map((collection) => ({
        //       collection,
        //       slug: `/collections/${collection.id}`,
        //     }))
        //   : [{}]),
      ],
    },
    {
      title: "ALL",
      data: [
        {
          label: "Tasks",
          icon: "check_circle",
          slug: "/[tab]/all/tasks",
        },
        {
          label: "Items",
          icon: "package_2",
          slug: "/[tab]/all/items",
        },
        {
          label: "Notes",
          icon: "sticky_note_2",
          slug: "/[tab]/all/notes",
        },
      ],
    },
  ];
};

export const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

function SpaceButton({ item }: any) {
  const theme = useColor(item.space.color, useColorScheme() === "dark");

  return (
    <ListItemButton
      style={({ pressed, hovered }: any) => ({
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
      })}
    >
      <View
        style={{
          width: 15,
          height: 15,
          borderRadius: 99,
          backgroundColor: theme[9],
        }}
      />
      <ListItemText
        primary={item.space.name}
        secondary={`${item.space?._count?.members} member${
          item.space?._count?.members !== 1 ? "s" : ""
        }`}
      />
    </ListItemButton>
  );
}

function SpacesTrigger() {
  const theme = useColorTheme();
  const [view, setView] = useState("all");
  const { data, error } = useSWR(["user/spaces"]);

  return (
    <Menu
      height={["70%"]}
      trigger={
        <IconButton style={{ marginLeft: "auto" }}>
          <Icon style={{ color: theme[8] }}>workspaces</Icon>
        </IconButton>
      }
    >
      {data ? (
        <FlatList
          data={data}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 12 }}>
              <Text heading style={{ fontSize: 40, paddingTop: 20 }}>
                Spaces
              </Text>
              <ButtonGroup
                containerStyle={{ marginVertical: 5 }}
                options={[
                  { label: "All", value: "all" },
                  { label: "Invitations", value: "invitations" },
                ]}
                state={[view, setView]}
              />
            </View>
          }
          contentContainerStyle={{ padding: 10 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: any) => <SpaceButton item={item} />}
        />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <ActivityIndicator />
      )}
    </Menu>
  );
}

export function Button({ section, item }: any) {
  const [loading, setLoading] = useState(false);
  const { sessionToken } = useUser();
  
  const redPalette = useColor("red", useColorScheme() === "dark");
  const purplePalette = useColor("purple", useColorScheme() === "dark");
  const greenPalette = useColor("green", useColorScheme() === "dark");
  const colors = { redPalette, purplePalette, greenPalette }[
    section.title === "Collections"
      ? "purplePalette"
      : section.title === "ALL"
      ? "greenPalette"
      : "redPalette"
  ];

  const isActive = Boolean(
    // item?.href === pathname || pathname?.includes(item.query)
    false
  );

  const { mutate } = useSWR(["user/tabs"]);

  const handlePress = async (tab) => {
    try {
      setLoading(true);
      const res = await sendApiRequest(
        sessionToken,
        "POST",
        "user/tabs",
        {},
        {
          body: JSON.stringify({
            slug: tab.slug,
            params: tab.params || {},
          }),
        }
      );
      router.replace({
        pathname: tab.slug,
        params: {
          tab: res.id,
          ...tab.params,
        },
      });
      await mutate();
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert("Something went wrong. Please try again later");
    }
  };
  const theme = useColorTheme();
  const { width } = useWindowDimensions();

  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: isActive
          ? theme[3]
          : theme[pressed ? 3 : width > 600 ? 2 : 1],
        paddingHorizontal: 20,
        paddingVertical: 7,
        flexDirection: "row",
        gap: 15,
        alignItems: "center",
      })}
      onPress={() => handlePress(item)}
    >
      <LinearGradient
        colors={[colors[5], colors[3]]}
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {item.collection ? (
          <Emoji size={21} emoji={item.collection.emoji || "1f4e6"} />
        ) : (
          <Icon size={21} style={{ color: colors[12] }}>
            {item.icon}
          </Icon>
        )}
      </LinearGradient>
      <Text textClassName="flex-1">{item?.collection?.name || item.label}</Text>
      {loading && <ActivityIndicator />}
    </Pressable>
  );
}

export function Sidebar() {
  const theme = useColorTheme();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getSidebarItems(session).then((sections) => {
      setData(sections);
      setIsLoading(false);
    });
  }, [session]);

  const { width, height } = useWindowDimensions();

  return (
    <View
      style={{
        height: "100%",
        backgroundColor: theme[width > 600 ? 2 : 1],
        width: width > 600 ? 240 : "100%",
        flexDirection: "column",
        maxHeight: width > 600 ? height : undefined,
      }}
    >
      {width > 600 && (
        <View
          style={{
            height: 70,
            paddingHorizontal: 20,
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Logo color={theme[6]} size={35} />
          <SpacesTrigger />
        </View>
      )}
      {width > 600 && (
        <View style={{ paddingHorizontal: 20 }}>
          <CreateDrawer>
            <Pressable
              style={({ pressed, hovered }: any) => ({
                flexDirection: "row",
                backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
                shadowColor: theme[4],
                borderWidth: 2,
                borderColor: theme[pressed ? 7 : hovered ? 6 : 5],
                shadowRadius: 10,
                marginBottom: 15,
                shadowOffset: { height: 5, width: 0 },
                borderRadius: 8,
                paddingHorizontal: 15,
                paddingVertical: 5,
                alignItems: "center",
                gap: 15,
                ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
              })}
            >
              <Icon bold style={{ opacity: 0.8 }}>
                add
              </Icon>
              <Text style={{ color: theme[11] }} weight={700}>
                Create
              </Text>
            </Pressable>
          </CreateDrawer>
        </View>
      )}
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <SectionList
          sections={data}
          ListHeaderComponent={
            width < 600 && (
              <Text
                style={{
                  marginTop: 150,
                  fontFamily: "heading",
                  textTransform: "uppercase",
                  fontSize: 50,
                  paddingHorizontal: 20,
                }}
              >
                Open
              </Text>
            )
          }
          ListEmptyComponent={
            <View className="items-center h-full">
              <Emoji emoji="1F62D" size={40} />
              <Text
                textClassName="mt-3"
                style={{ fontFamily: "body_600", fontSize: 17 }}
              >
                No results found
              </Text>
            </View>
          }
          contentContainerStyle={{
            paddingBottom: 30,
          }}
          renderItem={({ item, section }) => (
            <Button item={item} section={section} />
          )}
          renderSectionHeader={({ section }) =>
            section.title === "ALL" ? (
              <View style={{ paddingHorizontal: 20 }}>
                <View
                  style={{
                    height: 2,
                    backgroundColor: theme[4],
                    borderRadius: 9,
                    marginVertical: 10,
                  }}
                />
                <Text
                  variant="eyebrow"
                  style={{ marginBottom: 10, marginTop: 6 }}
                >
                  {section.title}
                </Text>
              </View>
            ) : (
              <Text
                variant="eyebrow"
                style={{
                  paddingHorizontal: 20,
                  marginBottom: 10,
                  marginTop: 20,
                }}
              >
                {section.title}
              </Text>
            )
          }
          keyExtractor={(item) => item.slug + JSON.stringify(item.params)}
        />
      )}
    </View>
  );
}
