import CreateTask from "@/components/task/create";
import MenuPopover, {
  MenuProps as DysperseMenuProps,
  MenuOption,
} from "@/ui/MenuPopover";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Dayjs } from "dayjs";
import { ReactElement, useCallback, useRef } from "react";
import { MenuProps } from "react-native-popup-menu";
interface DefaultEntityProps {
  label: object;
  name: string;
  due: Dayjs;
}

export const CreateEntityTrigger = ({
  children,
  menuProps,
  additional,
  popoverProps,
  defaultValues,
}: {
  children: ReactElement;
  menuProps?: MenuProps;
  additional?: MenuOption[];
  popoverProps?: Partial<DysperseMenuProps>;
  defaultValues: Partial<DefaultEntityProps>;
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
        defaultValues={defaultValues}
        mutate={(e) => {
          if (e !== null) alert(JSON.stringify(e));
        }}
        sheetRef={createTaskRef}
      />
    </>
  );
};
