import { useCollectionContext } from "@/components/collections/context";
import Icon from "@/ui/Icon";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { router, usePathname } from "expo-router";
import { memo, ReactElement, useRef } from "react";
import { LabelEditModal } from "./LabelEditModal";

export const ColumnMenuTrigger = memo(function ColumnMenuTrigger({
  label,
  children,
}: {
  label: any;
  children: ReactElement;
}) {
  const menuRef = useRef(null);
  const pathname = usePathname();
  const { mutate, openLabelPicker } = useCollectionContext();

  const editButton = (
    <LabelEditModal
      label={label}
      onLabelUpdate={(newLabel) => {
        mutate(
          (oldData) => {
            const labelIndex = oldData.labels.findIndex(
              (l) => l.id === label.id
            );
            if (labelIndex === -1) return oldData;
            return {
              ...oldData,
              labels: oldData.labels.map((l) =>
                l.id === label.id ? { ...l, ...newLabel } : l
              ),
            };
          },
          { revalidate: false }
        );
      }}
      trigger={
        <MenuItem>
          <Icon>edit</Icon>
          <Text variant="menuItem">Edit</Text>
        </MenuItem>
      }
    />
  );
  return (
    <>
      <MenuPopover
        trigger={children}
        menuRef={menuRef}
        options={[
          { renderer: () => editButton },
          {
            icon: "swipe",
            text: "Reorder",
            callback: () => {
              menuRef.current.close();
              router.push(pathname + "/reorder");
            },
          },
        ]}
      />
    </>
  );
});
