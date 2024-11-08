import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useColorTheme } from "@/ui/color/theme-provider";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { router, useLocalSearchParams } from "expo-router";
import { memo, useRef } from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { useCollectionContext } from "../context";

export const CategoryLabelButtons = memo(
  ({ setEditOrderMode }: { setEditOrderMode }) => {
    const { data, openLabelPicker, mutate } = useCollectionContext();
    const { id, type, hiddenLabels: rawHiddenLabels } = useLocalSearchParams();
    const menuRef = useRef(null);
    const theme = useColorTheme();
    const { session } = useSession();

    const hiddenLabels = rawHiddenLabels
      ? rawHiddenLabels?.split(",") || []
      : [];

    const isAll = id === "all";
    const isCategoryBased =
      COLLECTION_VIEWS[type.toString()]?.type === "Category Based";

    const toggleShowCompleted = async () => {
      const showCompleted = !data.showCompleted;
      await sendApiRequest(
        session,
        "PUT",
        "space/collections",
        {},
        { body: JSON.stringify({ id: data.id, showCompleted }) }
      );
      await mutate();
    };

    return (
      <MenuPopover
        menuRef={menuRef}
        containerStyle={{ width: 250 }}
        trigger={
          <Pressable style={{ position: "relative" }}>
            <IconButton
              icon="filter_alt"
              disabled
              size={40}
              style={{ opacity: 1 }}
              iconProps={{ filled: hiddenLabels.length > 0 }}
            />
            {hiddenLabels.length > 0 && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 12,
                  margin: 5,
                  height: 12,
                  backgroundColor: theme[11],
                  borderRadius: 10,
                  padding: 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: theme[2],
                    fontSize: 8,
                    lineHeight: 8,
                    textAlign: "center",
                  }}
                  weight={900}
                >
                  1
                </Text>
              </View>
            )}
          </Pressable>
        }
        options={[
          {
            renderer: () => (
              <Text variant="eyebrow" style={{ padding: 10, paddingBottom: 5 }}>
                Filter
              </Text>
            ),
          },
          session && {
            renderer: () => (
              <ConfirmationModal
                height={430}
                onSuccess={toggleShowCompleted}
                title={
                  data.showCompleted
                    ? "Hide completed tasks?"
                    : "Show completed tasks?"
                }
                disabled={!data.name}
                secondary="This will affect all views in this collection"
              >
                <MenuItem
                  onPress={() => {
                    if (!data.name)
                      Toast.show({ type: "info", text1: "Coming soon" });
                  }}
                >
                  <Text variant="menuItem" weight={300}>
                    Hide completed?
                  </Text>
                  {!data.showCompleted && (
                    <Icon style={{ marginLeft: "auto" }}>check</Icon>
                  )}
                </MenuItem>
              </ConfirmationModal>
            ),
          },
          // Labels
          {
            renderer: () => (
              <Text variant="eyebrow" style={{ padding: 10, paddingBottom: 5 }}>
                {data.labels.length} label{data.labels.length !== 1 && "s"}
              </Text>
            ),
          },
          ...data.labels.map((label) => ({
            icon: <Emoji emoji={label.emoji} />,
            text: label.name,
            selected: !hiddenLabels.includes(label.id),
            callback: () =>
              router.setParams({
                hiddenLabels: hiddenLabels.includes(label.id)
                  ? hiddenLabels.filter((l) => l !== label.id).join(",")
                  : [...hiddenLabels, label.id].join(","),
              }),
          })),
          !isAll &&
            session && {
              icon: "edit",
              text: "Edit",
              callback: () => {
                openLabelPicker();
                menuRef.current.close();
              },
            },
          !isAll &&
            session &&
            isCategoryBased && {
              icon: "swipe",
              text: "Reorder",
              callback: () => setEditOrderMode(true),
            },
        ].filter((e) => e)}
      />
    );
  }
);

