import { handleLabelDelete } from "@/app/(app)/everything";
import { useCollectionContext } from "@/components/collections/context";
import { createTab } from "@/components/layout/openTab";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import ConfirmationModal from "@/ui/ConfirmationModal";
import DropdownMenu, { DropdownMenuItem } from "@/ui/DropdownMenu";
import { showErrorToast } from "@/utils/errorToast";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { memo, ReactElement } from "react";
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
  const pathname = usePathname();
  const { session } = useSession();
  const { mutate } = useCollectionContext();
  const { id } = useLocalSearchParams();
  const { sessionToken } = useUser();

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
      trigger={<DropdownMenuItem icon="edit" text="Edit" />}
    />
  );
  return disabled ? (
    children
  ) : (
    <>
      <DropdownMenu
        horizontalPlacement="center"
        options={[
          { renderer: () => editButton },
          id !== "all" && {
            icon: "back_hand",
            text: "Reorder",
            onPress: () => {
              router.push(pathname + "/reorder");
            },
          },
          {
            icon: "open_in_new",
            text: "Open label",
            onPress: () => {
              createTab(sessionToken, {
                slug: "/[tab]/labels/[id]",
                params: { type: "list", id: label.id },
              });
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
                    showErrorToast();
                  }
                }}
                height={350}
              >
                <DropdownMenuItem icon="delete" text="Delete" />
              </ConfirmationModal>
            ),
          },
        ]}
      >
        {children}
      </DropdownMenu>
    </>
  );
});

