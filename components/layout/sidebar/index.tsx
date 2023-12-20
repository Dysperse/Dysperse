import { CreateDrawer } from "@/components/layout/bottom-navigation/create-drawer";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
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

export const getSidebarItems = async (session) => {
  const req = await sendApiRequest(session, "GET", "space/tasks/boards", {});

  return [
    {
      title: "Perspectives",
      data: [
        {
          label: "Weeks",
          icon: "calendar_view_week",
          href: "/perspectives/agenda/week/" + dayjs().format("YYYY-MM-DD"),
          query: "/perspectives/agenda/week/",
        },
        {
          label: "Months",
          icon: "calendar_view_month",
          href: "/perspectives/agenda/month/" + dayjs().format("YYYY-MM-DD"),
          query: "/perspectives/agenda/month/",
        },
        {
          label: "Years",
          icon: "view_compact",
          href: "/perspectives/agenda/year/" + dayjs().format("YYYY-MM-DD"),
          query: "/perspectives/agenda/year/",
        },
        {
          label: "Upcoming",
          icon: "calendar_clock",
          href: "/perspectives/upcoming",
        },
        {
          label: "Backlog",
          icon: "event_upcoming",
          href: "/perspectives/backlog",
        },
        {
          label: "Unscheduled",
          icon: "history_toggle_off",
          href: "/perspectives/unscheduled",
        },
        {
          label: "Completed",
          icon: "check_circle",
          href: "/perspectives/completed",
        },
        {
          label: "Difficulty",
          icon: "priority_high",
          href: "/perspectives/difficulty",
        },
      ],
    },
    {
      title: "Collections",
      data: [
        {
          label: "Create",
          icon: "add",
          href: "/collections/create",
        },
        ...(req && Array.isArray(req)
          ? req.map((collection) => ({
              collection,
              href: `/collections/${collection.id}`,
            }))
          : [{}]),
      ],
    },
    {
      title: "Other",
      data: [
        {
          label: "Tasks",
          icon: "check_circle",
          href: "/all/tasks",
        },
        {
          label: "Items",
          icon: "package_2",
          href: "/all/items",
        },
        {
          label: "Notes",
          icon: "sticky_note_2",
          href: "/all/notes",
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

export function Button({ section, item }: any) {
  const [loading, setLoading] = useState(false);
  const redPalette = useColor("red", useColorScheme() === "dark");
  const purplePalette = useColor("purple", useColorScheme() === "dark");
  const { sessionToken } = useUser();
  const colors = { redPalette, purplePalette }[
    section.title === "Collections" ? "purplePalette" : "redPalette"
  ];

  const pathname = usePathname();
  const isActive = Boolean(
    item?.href === pathname || pathname?.includes(item.query)
  );

  const handlePress = async (tab) => {
    try {
      setLoading(true);
      const res = await sendApiRequest(
        sessionToken,
        "POST",
        "user/tabs",
        {
          ...(tab.collection
            ? {
                boardId: tab.collection.id,
              }
            : {
                tabData: JSON.stringify({
                  href: tab.href,
                  icon: tab.icon,
                  label: tab.label,
                  query: tab.query,
                }),
              }),
        },
        null
      );
      console.log(res);
      router.push(item.href);
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
          <IconButton style={{ marginLeft: "auto" }}>
            <Icon style={{ color: theme[8] }}>workspaces</Icon>
          </IconButton>
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
          renderSectionHeader={({ section }) => (
            <Text
              variant="eyebrow"
              style={{ paddingHorizontal: 20, marginBottom: 10, marginTop: 20 }}
            >
              {section.title}
            </Text>
          )}
          keyExtractor={(item) => `basicListEntry-${item.href}`}
        />
      )}
    </View>
  );
}
