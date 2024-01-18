import { useKeyboardShortcut } from "@/helpers/useKeyboardShortcut";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router, useGlobalSearchParams } from "expo-router";
import { memo } from "react";
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

  useKeyboardShortcut(["v a", "v k", "v s", "v m", "v g", "v d"], (key) => {
    const index = options.findIndex(
      (i) => i.text[0].toLowerCase() === key.split(" ")[1]
    );
    options[index].callback();
  });

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
        options={[
          { icon: "edit", text: "Rename", callback: () => {} },
          { icon: "mood", text: "Change icon", callback: () => {} },
          { icon: "label", text: "Edit labels", callback: () => {} },
          { icon: "delete", text: "Delete", callback: () => {} },
        ]}
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
        options={[
          { icon: "auto_awesome", text: "Auto", callback: () => {} },
          { icon: "sort_by_alpha", text: "Alphabetical", callback: () => {} },
          { icon: "calendar_month", text: "Due date", callback: () => {} },
          { icon: "timeline", text: "Last edited", callback: () => {} },
        ]}
      />

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
