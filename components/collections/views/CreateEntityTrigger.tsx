import CreateTask from "@/components/task/create";
import MenuPopover, {
  MenuProps as DysperseMenuProps,
  MenuOption,
} from "@/ui/MenuPopover";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Dayjs } from "dayjs";
import { ReactElement, useCallback, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { MenuProps } from "react-native-popup-menu";
interface DefaultEntityProps {
  label: object;
  name: string;
  date: Dayjs;
  agendaOrder: string;
  collectionId: string;
}

export const CreateEntityTrigger = ({
  children,
  menuProps,
  additional,
  popoverProps,
  defaultValues,
  mutateList,
  shortcutEnabled = false,
}: {
  children: ReactElement;
  menuProps?: MenuProps;
  additional?: MenuOption[];
  popoverProps?: Partial<DysperseMenuProps>;
  defaultValues: Partial<DefaultEntityProps>;
  mutateList?: (e) => void;
  shortcutEnabled?: boolean;
}) => {
  const createTaskRef = useRef<BottomSheetModal>(null);
  const handleCreateTask = useCallback(
    () => createTaskRef.current?.present(),
    []
  );
  useHotkeys("alt+t", handleCreateTask, { enabled: shortcutEnabled });
  return (
    <>
      <MenuPopover
        menuProps={menuProps}
        trigger={children}
        options={[
          { icon: "task_alt", text: "Task", callback: handleCreateTask },
          { icon: "sticky_note_2", text: "Note", callback: () => {} },
          { icon: "package_2", text: "Item", callback: () => {} },
          ...(additional ?? []),
        ]}
        {...(popoverProps as any)}
      />
      <CreateTask
        defaultValues={defaultValues}
        mutate={mutateList}
        sheetRef={createTaskRef}
      />
    </>
  );
};
