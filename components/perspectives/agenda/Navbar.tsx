import { useAgendaContext } from "@/app/(app)/[tab]/perspectives/agenda/context";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType } from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  navigationButton: {
    borderRadius: 99,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

export function PerspectivesNavbar({
  handleToday,
  currentDateStart,
  currentDateEnd,
}: any) {
  const { start, type } = useAgendaContext();

  const titleFormat = {
    week: "[W]W • MMMM",
    month: "YYYY",
    year: "YYYY",
  }[type];

  const isCurrent = dayjs().isBetween(
    currentDateStart,
    currentDateEnd,
    "day",
    "[]"
  );

  const { session: sessionToken } = useSession();
  const { mutate, session } = useUser();
  const params = useLocalSearchParams();

  const handlePrev = useCallback(() => {
    const tab = session?.user?.tabs?.find((i) => i.id === params.tab);

    const href = `/perspectives/agenda/${type}/${dayjs(start)
      .subtract(1, type as ManipulateType)
      .format("YYYY-MM-DD")}`;

    if (tab) {
      sendApiRequest(sessionToken, "PUT", "user/tabs", {
        id: tab.id,
        tabData: JSON.stringify({
          ...tab.tabData,
          href: href,
        }),
      }).then(() => mutate());
    }
    // Change the tab
    router.push(href);
  }, [type, start, sessionToken, mutate, params.tab, session]);

  const handleNext = useCallback(() => {
    const tab = session?.user?.tabs?.find((i) => i.id === params.tab);

    const href = `/perspectives/agenda/${type}/${dayjs(start)
      .add(1, type as ManipulateType)
      .format("YYYY-MM-DD")}`;

    if (tab) {
      sendApiRequest(sessionToken, "PUT", "user/tabs", {
        id: tab.id,
        tabData: JSON.stringify({
          ...tab.tabData,
          href: href,
        }),
      }).then(() => mutate());
    }

    router.push(href);
  }, [type, start, sessionToken, mutate, params.tab, session]);

  const insets = useSafeAreaInsets();
  const theme = useColorTheme();

  return (
    <View
      className="rounded-full p-3 pb-0 z-10"
      style={{ marginTop: insets.top, marginBottom: -70, height: 70 }}
    >
      <View
        className="flex-row items-center p-2 py-3 rounded-full"
        style={{ height: "100%", backgroundColor: theme[3] }}
      >
        <Text textClassName="ml-2 mr-auto" numberOfLines={1}>
          {dayjs(start).format(titleFormat)}
        </Text>
        {!isCurrent && (
          <Pressable
            style={({ pressed, hovered }: any) => [
              styles.navigationButton,
              {
                backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
              },
            ]}
            onPress={handleToday}
          >
            <Icon textClassName="font-gray-600">calendar_today</Icon>
          </Pressable>
        )}
        <Pressable
          onPress={handlePrev}
          style={({ pressed, hovered }: any) => [
            styles.navigationButton,
            {
              backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
            },
          ]}
        >
          <Icon textClassName="font-gray-600">arrow_back_ios_new</Icon>
        </Pressable>
        <Pressable
          onPress={handleNext}
          style={({ pressed, hovered }: any) => [
            styles.navigationButton,
            {
              backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
            },
          ]}
        >
          <Icon textClassName="font-gray-600">arrow_forward_ios</Icon>
        </Pressable>
      </View>
    </View>
  );
}
