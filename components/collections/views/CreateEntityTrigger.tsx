import CreateTask from "@/components/task/create";
import { useHotkeys } from "@/helpers/useHotKeys";
import { MenuProps as DysperseMenuProps, MenuOption } from "@/ui/MenuPopover";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Dayjs } from "dayjs";
import { ReactElement, useCallback, useRef } from "react";
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
  useHotkeys("n", handleCreateTask, { enabled: shortcutEnabled });

  return (
    <>
      <CreateTask
        defaultValues={defaultValues}
        mutate={mutateList}
        sheetRef={createTaskRef}
      >
        {children}
      </CreateTask>
    </>
  );
};
