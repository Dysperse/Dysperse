import { useAgendaContext } from "@/app/(app)/[tab]/perspectives/agenda/context";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType } from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
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
    const href = `/[tab]/perspectives/agenda/${type}/${dayjs(start)
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

    const href = `/[tab]/perspectives/agenda/${type}/${dayjs(start)
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
  const { width } = useWindowDimensions();

  return (
    <LinearGradient
      colors={[theme[width > 600 ? 3 : 2], theme[width > 600 ? 4 : 3]]}
      style={{
        paddingHorizontal: 20,
        borderBottomRightRadius: width > 600 ? 0 : 30,
        borderBottomLeftRadius: width > 600 ? 0 : 30,
        paddingTop: insets.top,
        marginBottom: -70,
        flexDirection: "row",
        height: 70 + insets.top,
        alignItems: "center",
        zIndex: 9999,
        backgroundColor: theme[3],
      }}
    >
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} weight={600}>
          {dayjs(start).format(titleFormat).split("•")?.[0]}
        </Text>
        <Text numberOfLines={1} style={{ opacity: 0.6 }}>
          {dayjs(start).format(titleFormat).split("• ")?.[1]}
        </Text>
      </View>
      {!isCurrent && (
        <TouchableOpacity style={styles.navigationButton} onPress={handleToday}>
          <Icon textClassName="font-gray-600">calendar_today</Icon>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={handlePrev} style={styles.navigationButton}>
        <Icon textClassName="font-gray-600">arrow_back_ios_new</Icon>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleNext} style={styles.navigationButton}>
        <Icon textClassName="font-gray-600">arrow_forward_ios</Icon>
      </TouchableOpacity>
    </LinearGradient>
  );
}
