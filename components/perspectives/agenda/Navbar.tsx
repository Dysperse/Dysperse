import { useAgendaContext } from "@/app/(app)/[tab]/perspectives/agenda/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { Menu } from "@/ui/Menu";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs, { ManipulateType } from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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

function SortMenu({ children }: { children: JSX.Element }) {
  const theme = useColorTheme();
  const menuRef = useRef<BottomSheetModal>(null);

  const handleClose = useCallback(() => menuRef.current?.close(), []);

  return (
    <Menu trigger={children} height={[500]} menuRef={menuRef}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 20,
          paddingHorizontal: 20,
          marginBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme[6],
        }}
      >
        <Text weight={300} style={{ fontSize: 30, color: theme[11] }}>
          Sort by
        </Text>
        <IconButton
          icon="close"
          variant="outlined"
          size={55}
          onPress={handleClose}
        />
      </View>
      <View style={{ paddingHorizontal: 20, gap: 20 }}>
        {[
          { key: "Auto", icon: "magic_button" },
          { key: "Title", icon: "sort_by_alpha" },
          { key: "Recently modified", icon: "schedule" },
          { key: "Custom order", icon: "hand_gesture" },
        ].map(({ key, icon }) => (
          <Button
            key={key}
            variant={key === "Auto" ? "filled" : "outlined"}
            style={{ height: 70, paddingHorizontal: 20 }}
          >
            <ButtonText style={{ fontSize: 20 }} weight={600}>
              {key}
            </ButtonText>
            <Icon size={30} style={{ marginLeft: "auto" }}>
              {icon}
            </Icon>
          </Button>
        ))}
      </View>
    </Menu>
  );
}

const NavbarButtons = memo(function PrevButton({
  isCurrent,
  handlePrev,
  handleNext,
  handleToday,
}: {
  isCurrent: boolean;
  handlePrev: () => void;
  handleNext: () => void;
  handleToday: () => void;
}) {
  return (
    <>
      {!isCurrent && (
        <TouchableOpacity style={styles.navigationButton} onPress={handleToday}>
          <Icon>calendar_today</Icon>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={handlePrev} style={styles.navigationButton}>
        <Icon>arrow_back_ios_new</Icon>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleNext} style={styles.navigationButton}>
        <Icon>arrow_forward_ios</Icon>
      </TouchableOpacity>
    </>
  );
});

function PerspectivesNavbar({ currentDateStart, currentDateEnd, error }: any) {
  const insets = useSafeAreaInsets();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { start, type } = useAgendaContext();

  const titleFormat = {
    week: "[Week #]W • MMM YYYY",
    month: "YYYY",
    year: "YYYY",
  }[type];

  const isCurrent = dayjs().isBetween(
    currentDateStart,
    currentDateEnd,
    "day",
    "[]"
  );

  const handlePrev = useCallback(() => {
    router.setParams({
      start: dayjs(start)
        .subtract(1, type as ManipulateType)
        .format("YYYY-MM-DD"),
    });
  }, [type, start]);

  const handleNext = useCallback(() => {
    router.setParams({
      start: dayjs(start)
        .startOf(type as ManipulateType)
        .add(1, type as ManipulateType)
        .format("YYYY-MM-DD"),
    });
  }, [type, start]);

  const handleToday = useCallback(() => {
    router.setParams({
      start: dayjs().format("YYYY-MM-DD"),
    });
  }, []);

  return (
    <LinearGradient
      colors={[theme[breakpoints.md ? 1 : 2], theme[breakpoints.md ? 3 : 3]]}
      style={{
        paddingHorizontal: 20,
        paddingRight: 10,
        paddingTop: insets.top,
        flexDirection: "row",
        height: 70 + insets.top,
        alignItems: "center",
        zIndex: 9999,
        backgroundColor: theme[3],
      }}
    >
      <View style={{ flexGrow: 1, flexDirection: "row", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <View>
            <Text numberOfLines={1} weight={600}>
              {dayjs(start).format(titleFormat).split("•")?.[0]}
            </Text>
            <Text numberOfLines={1} style={{ opacity: 0.6 }}>
              {dayjs(start).format(titleFormat).split("• ")?.[1]}
            </Text>
          </View>
        </View>
      </View>
      <SortMenu>
        <TouchableOpacity style={styles.navigationButton}>
          <Icon>filter_list</Icon>
        </TouchableOpacity>
      </SortMenu>
      <NavbarButtons
        isCurrent={isCurrent}
        handleToday={handleToday}
        handlePrev={handlePrev}
        handleNext={handleNext}
      />
    </LinearGradient>
  );
}

export default memo(PerspectivesNavbar);
