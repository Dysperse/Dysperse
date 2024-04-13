import { useCommandPaletteContext } from "@/components/command-palette/context";
import { useFocusPanelContext } from "@/components/focus-panel/context";
import CreateTask from "@/components/task/create";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import useSWR from "swr";
import { actionStyles } from "../../app/(app)";

const styles = StyleSheet.create({
  badge: {
    width: 20,
    height: 20,
    borderRadius: 99,
    marginLeft: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  sharedText: {
    fontSize: 12,
    paddingTop: 1,
  },
});

export function Actions() {
  const theme = useColorTheme();
  const { handleOpen } = useCommandPaletteContext();
  const { setFocus, isFocused }: any = useFocusPanelContext();
  const togglePanel = () => setFocus((d) => !d);
  const openEverything = () => router.push("/everything");

  const { data: sharedWithMe } = useSWR(["user/collectionAccess"]);
  const hasUnread =
    Array.isArray(sharedWithMe) && sharedWithMe?.filter((c) => !c.hasSeen);

  return (
    <View>
      <Text variant="eyebrow" style={actionStyles.title}>
        Start
      </Text>
      <CreateTask mutate={() => {}}>
        <TouchableOpacity style={actionStyles.item}>
          <Icon>note_stack_add</Icon>
          <Text style={{ color: theme[11] }} numberOfLines={1}>
            New item...
          </Text>
        </TouchableOpacity>
      </CreateTask>
      <TouchableOpacity style={actionStyles.item} onPress={openEverything}>
        <Icon>category</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          Labels & Collections...
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={actionStyles.item}
        onPress={() => handleOpen("Shared with me")}
      >
        <Icon>group</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          Shared with me
        </Text>
        {Array.isArray(hasUnread) && hasUnread?.length > 0 && (
          <View style={[styles.badge, { backgroundColor: theme[9] }]}>
            <Text style={styles.sharedText} weight={900}>
              {sharedWithMe.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={actionStyles.item} onPress={togglePanel}>
        <Icon>adjust</Icon>
        <Text style={{ color: theme[11] }} numberOfLines={1}>
          {isFocused ? "End" : "Start"} focus...
        </Text>
      </TouchableOpacity>
    </View>
  );
}
