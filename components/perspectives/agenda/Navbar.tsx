import { useSession } from "@/context/AuthProvider";
import { useOpenTab } from "@/context/tabs";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import dayjs, { ManipulateType } from "dayjs";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAgendaContext } from "@/app/(app)/perspectives/agenda/context";

export function PerspectivesNavbar({
  handleToday,
  currentDateStart,
  currentDateEnd,
}) {
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
  const { activeTab } = useOpenTab();

  const handlePrev = useCallback(() => {
    const tab = session?.user?.tabs?.find((i) => i.id === activeTab);

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
  }, [
    router,
    type,
    start,
    sessionToken,
    mutate,
    activeTab,
    session,
    activeTab,
  ]);

  const handleNext = useCallback(() => {
    const tab = session?.user?.tabs?.find((i) => i.id === activeTab);

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
  }, [
    router,
    type,
    start,
    sessionToken,
    mutate,
    activeTab,
    session,
    activeTab,
  ]);
  const insets = useSafeAreaInsets();

  return (
    <View className="p-4 pb-0" style={{ marginTop: insets.top, height: 80 }}>
      <View
        className="flex-row items-center bg-gray-100 p-2 py-3 rounded-full"
        style={{ height: "100%" }}
      >
        <Text textClassName="ml-2 mr-auto" numberOfLines={1}>
          {dayjs(start).format(titleFormat)}
        </Text>
        {!isCurrent && (
          <Pressable
            className="flex h-full justify-center active:bg-gray-200 px-2 rounded-2xl"
            onPress={handleToday}
          >
            <Icon textClassName="font-gray-600">calendar_today</Icon>
          </Pressable>
        )}
        <Pressable
          onPress={handlePrev}
          className="flex h-full justify-center active:bg-gray-200 px-2 rounded-2xl"
        >
          <Icon textClassName="font-gray-600">arrow_back_ios_new</Icon>
        </Pressable>
        <Pressable
          onPress={handleNext}
          className="flex h-full justify-center active:bg-gray-200 px-2 rounded-2xl"
        >
          <Icon textClassName="font-gray-600">arrow_forward_ios</Icon>
        </Pressable>
      </View>
    </View>
  );
}
