import { useKeyboardShortcut } from "@/helpers/useKeyboardShortcut";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs, { ManipulateType } from "dayjs";
import { router, useGlobalSearchParams } from "expo-router";
import { memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useCollectionContext } from "./context";

const styles = StyleSheet.create({
  navbarIconButton: {
    flexDirection: "row",
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    borderRadius: 20,
  },
});

function AgendaNavbarButtons() {
  const theme = useColorTheme();
  const { agendaView, start }: any = useGlobalSearchParams();

  const handlePrev = useCallback(() => {
    router.setParams({
      start: dayjs(start)
        .subtract(1, agendaView as ManipulateType)
        .format("YYYY-MM-DD"),
    });
  }, [agendaView, start]);

  const handleNext = useCallback(() => {
    router.setParams({
      start: dayjs(start)
        .startOf(agendaView as ManipulateType)
        .add(1, agendaView as ManipulateType)
        .format("YYYY-MM-DD"),
    });
  }, [agendaView, start]);

  const handleToday = useCallback(() => {
    router.setParams({
      start: dayjs().format("YYYY-MM-DD"),
    });
  }, []);

  const isTodaysView = dayjs().isBetween(
    dayjs(start).startOf(agendaView as ManipulateType),
    dayjs(start).endOf(agendaView as ManipulateType),
    "day"
  );

  const titleFormat = {
    week: "[Week #]W • MMM YYYY",
    month: "YYYY",
    year: "YYYY",
  }[agendaView];

  return (
    <>
      <View
        style={{
          marginRight: !isTodaysView ? undefined : "auto",
          flexDirection: "row",
          borderWidth: 1,
          borderColor: theme[6],
          height: 50,
          borderRadius: 20,
          alignItems: "center",
          paddingHorizontal: 10,
        }}
      >
        <IconButton onPress={handlePrev}>
          <Icon>west</Icon>
        </IconButton>
        <Button>
          <Text numberOfLines={1} weight={600}>
            {dayjs(start).format(titleFormat).split("•")?.[0]}
          </Text>
          <Text numberOfLines={1} style={{ opacity: 0.6 }}>
            {dayjs(start).format(titleFormat).split("• ")?.[1]}
          </Text>
        </Button>
        <IconButton onPress={handleNext}>
          <Icon>east</Icon>
        </IconButton>
      </View>

      {!isTodaysView && (
        <View
          style={{
            marginRight: "auto",
            flexDirection: "row",
            borderWidth: 1,
            borderColor: theme[6],
            height: 50,
            borderRadius: 20,
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          <IconButton onPress={handleToday}>
            <Icon>today</Icon>
          </IconButton>
        </View>
      )}
    </>
  );
}

export const CollectionNavbar = memo(function CollectionNavbar() {
  const theme = useColorTheme();
  const { data } = useCollectionContext();
  const { type } = useGlobalSearchParams();

  const options = [
    { icon: "calendar_today", text: "Agenda" },
    { icon: "view_kanban", text: "Kanban" },
    { icon: "view_agenda", text: "Stream" },
    { icon: "dashboard", text: "Masonry" },
    { icon: "view_cozy", text: "Grid" },
    { icon: "exercise", text: "Difficulty" },
  ].map((i) => ({
    ...i,
    selected: i.text.toLowerCase() === type,
    callback: () => router.setParams({ type: i.text.toLowerCase() }),
  }));

  const collectionMenuOptions = [
    { icon: "edit", text: "Rename", callback: () => alert("rename") },
    { icon: "mood", text: "Change icon", callback: () => alert("mood") },
    { icon: "label", text: "Edit labels", callback: () => alert("label") },
    { icon: "delete", text: "Delete", callback: () => alert("delete") },
  ];

  const filterOptions = [
    {
      icon: "auto_awesome",
      text: "Auto",
      callback: () => alert("filter auto"),
    },
    {
      icon: "sort_by_alpha",
      text: "Alphabetical",
      callback: () => alert("filter az"),
    },
    {
      icon: "calendar_month",
      text: "Due date",
      callback: () => alert("filter due"),
    },
    {
      icon: "timeline",
      text: "Last edited",
      callback: () => alert("filter edited"),
    },
  ];

  useKeyboardShortcut(["v a", "v k", "v s", "v m", "v g", "v d"], (key) => {
    const index = options.findIndex(
      (i) => i.text[0].toLowerCase() === key.split(" ")[1]
    );
    options[index].callback();
  });

  useKeyboardShortcut(["e r", "e i", "e e", "e d"], (key) => {
    const index = collectionMenuOptions.findIndex(
      (i) => i.text[0].toLowerCase() === key.split(" ")[1]
    );
    collectionMenuOptions[index].callback();
  });

  useKeyboardShortcut(["f a", "f d", "f l", "f t"], (key) => {
    const index = filterOptions.findIndex(
      (i) => i.text[0].toLowerCase() === key.split(" ")[1]
    );
    filterOptions[index].callback();
  });

  useKeyboardShortcut(["s"], () => alert("Stopwatch"));
  useKeyboardShortcut(["a"], () => alert("Activity"));
  useKeyboardShortcut(["i"], () => alert("Share"));

  return (
    <View
      style={{
        height: 80,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <MenuPopover
        trigger={
          <IconButton
            disabled
            variant="filled"
            style={[
              styles.navbarIconButton,
              {
                width: 60,
                paddingLeft: 5,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                marginRight: -10,
              },
            ]}
          >
            <Icon size={20}>
              {options.find((i) => i.selected)?.icon || "calendar_today"}
            </Icon>
            <Icon>expand_more</Icon>
          </IconButton>
        }
        options={options}
      />
      <MenuPopover
        trigger={
          <IconButton
            disabled
            variant="filled"
            style={[
              styles.navbarIconButton,
              {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                justifyContent: "flex-start",
                paddingLeft: 5,
                width: 140,
                marginRight: "auto",
              },
            ]}
          >
            <Text style={{ fontSize: 17 }} weight={300}>
              {data.name}
            </Text>
          </IconButton>
        }
        options={collectionMenuOptions}
      />
      <MenuPopover
        menuProps={{
          style: { marginRight: "auto" },
        }}
        trigger={
          <IconButton disabled variant="filled" style={styles.navbarIconButton}>
            <Icon>filter_list</Icon>
          </IconButton>
        }
        options={filterOptions}
      />
      {type === "agenda" && <AgendaNavbarButtons />}
      <IconButton variant="filled" style={styles.navbarIconButton}>
        <Icon>timer</Icon>
      </IconButton>
      <IconButton variant="filled" style={styles.navbarIconButton}>
        <Icon>upcoming</Icon>
      </IconButton>
      <IconButton variant="filled" style={styles.navbarIconButton}>
        <Icon>magic_button</Icon>
      </IconButton>
      <Pressable
        style={({ pressed, hovered }: any) => [
          styles.navbarIconButton,
          {
            backgroundColor: theme[pressed ? 11 : hovered ? 10 : 9],
            width: 120,
            gap: 15,
          },
        ]}
      >
        <Icon style={{ color: theme[1] }}>person_add</Icon>
        <Text style={{ color: theme[1], fontSize: 17 }}>Share</Text>
      </Pressable>
    </View>
  );
});
