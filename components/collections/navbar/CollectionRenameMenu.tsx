import Icon from "@/ui/Icon";
import { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { router } from "expo-router";
import { memo } from "react";
import { useCollectionContext } from "../context";

export const CollectionRenameMenu = memo(function CollectionRenameMenu({
  menuRef,
}: {
  menuRef: React.MutableRefObject<any>;
}) {
  const collection = useCollectionContext();

  const handleOpen = (e) => {
    e.preventDefault();
    menuRef.current.close();
    router.push(`/collection/${collection.data.id}`);
  };

  return (
    <MenuItem onPress={handleOpen}>
      <Icon>info</Icon>
      <Text variant="menuItem" weight={300}>
        Edit
      </Text>
    </MenuItem>
  );
});
