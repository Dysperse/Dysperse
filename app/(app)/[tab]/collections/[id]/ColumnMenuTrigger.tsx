import { useCollectionContext } from "@/components/collections/context";
import Icon from "@/ui/Icon";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { memo, ReactElement } from "react";
import { LabelEditModal } from "./LabelEditModal";

export const ColumnMenuTrigger = memo(function ColumnMenuTrigger({
  label,
  children,
}: {
  label: any;
  children: ReactElement;
}) {
  const { mutate, openLabelPicker } = useCollectionContext();

  return (
    <MenuPopover
      trigger={children}
      containerStyle={{ width: 160 }}
      options={[
        {
          renderer: () => (
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
          ),
        },
        {
          icon: "label",
          text: "Select labels",
          callback: openLabelPicker,
        },
      ]}
    />
  );
});
