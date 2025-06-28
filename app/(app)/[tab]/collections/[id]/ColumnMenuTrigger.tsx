import { handleLabelDelete } from "@/app/(app)/everything";
import { useCollectionContext } from "@/components/collections/context";
import { useSession } from "@/context/AuthProvider";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { router, usePathname } from "expo-router";
import { memo, ReactElement, useRef } from "react";
import Toast from "react-native-toast-message";
import { LabelEditModal } from "./LabelEditModal";

export const ColumnMenuTrigger = memo(function ColumnMenuTrigger({
  label,
  children,
  disabled,
}: {
  label: any;
  children: ReactElement;
  disabled?: boolean;
}) {
  const menuRef = useRef(null);
  const pathname = usePathname();
  const { session } = useSession();
  const { mutate } = useCollectionContext();

  const editButton = (
    <LabelEditModal
      label={label}
      header="Edit label"
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
  return disabled ? (
    children
  ) : (
    <>
      <MenuPopover
        trigger={children}
        menuRef={menuRef}
        menuProps={{
          rendererProps: { placement: "bottom" },
        }}
        options={[
          { renderer: () => editButton },
          {
            icon: "back_hand",
            text: "Reorder",
            callback: () => {
              menuRef.current.close();
              router.push(pathname + "/reorder");
            },
          },
          {
            renderer: () => (
              <ConfirmationModal
                title="Delete label?"
                secondary="Items won't be deleted"
                onSuccess={async () => {
                  try {
                    await handleLabelDelete(session, label.id);
                    mutate(
                      (oldData) => ({
                        ...oldData,
                        kanbanOrder: oldData.kanbanOrder.filter(
                          (id) => id !== label.id
                        ),
                        listOrder: oldData.listOrder.filter(
                          (id) => id !== label.id
                        ),
                        gridOrder: oldData.gridOrder.filter(
                          (id) => id !== label.id
                        ),
                        labels: oldData.labels.filter((l) => l.id !== label.id),
                      }),
                      { revalidate: false }
                    );
                  } catch {
                    Toast.show({ type: "error" });
                  }
                }}
                height={350}
              >
                <MenuItem>
                  <Icon>delete</Icon>
                  <Text variant="menuItem">Delete</Text>
                </MenuItem>
              </ConfirmationModal>
            ),
          },
        ]}
      />
    </>
  );
});

