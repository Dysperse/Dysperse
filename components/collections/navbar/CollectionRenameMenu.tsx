import Icon from "@/ui/Icon";
import { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { router, useLocalSearchParams } from "expo-router";
import { ReactElement, memo } from "react";
import { useCollectionContext } from "../context";

export const CollectionRenameMenu = memo(function CollectionRenameMenu({
  children,
  menuRef,
}: {
  children: ReactElement;
  menuRef: React.MutableRefObject<any>;
}) {
  const { tab } = useLocalSearchParams();
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
        Edit collection
      </Text>
    </MenuItem>
  );
});
