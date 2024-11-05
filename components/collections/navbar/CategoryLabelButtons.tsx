import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useLocalSearchParams } from "expo-router";
import { memo, useRef } from "react";
import Toast from "react-native-toast-message";
import { useCollectionContext } from "../context";

export const CategoryLabelButtons = memo(() => {
  const { data, openLabelPicker, mutate } = useCollectionContext();
  const { id, type } = useLocalSearchParams();
  const menuRef = useRef(null);
  const { session } = useSession();

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
      trigger={<IconButton icon="filter_alt" size={40} />}
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
          selected: true,
          callback: () =>
            Toast.show({
              type: "info",
              text1: "Coming soon!",
              text2:
                "Soon, you'll be able to temporarily show/hide labels in a collection",
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
});
