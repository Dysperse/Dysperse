import CreateTask from "@/components/task/create";
import MenuPopover, {
  MenuProps as DysperseMenuProps,
  MenuOption,
} from "@/ui/MenuPopover";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ReactElement, useCallback, useRef } from "react";
import { MenuProps } from "react-native-popup-menu";

export const CreateEntityTrigger = ({
  children,
  menuProps,
  additional,
  popoverProps,
}: {
  children: ReactElement;
  menuProps?: MenuProps;
  additional?: MenuOption[];
  popoverProps?: Partial<DysperseMenuProps>;
}) => {
  const createTaskRef = useRef<BottomSheetModal>(null);
  const handleCreateTask = useCallback(
    () => createTaskRef.current?.present(),
    []
  );
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
        {...popoverProps}
      />
      <CreateTask
        mutate={(e) => {
          if (e !== null) alert(JSON.stringify(e));
        }}
        sheetRef={createTaskRef}
      />
    </>
  );
};
