import CreateTask from "@/components/task/create";
import { useHotkeys } from "@/helpers/useHotKeys";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Dayjs } from "dayjs";
import { ReactElement, useCallback, useRef } from "react";
interface DefaultEntityProps {
  label: object;
  name: string;
  date: Dayjs;
  agendaOrder: string;
  collectionId: string;
}

export const CreateEntityTrigger = ({
  children,
  defaultValues,
  mutateList,
  shortcutEnabled = false,
}: {
  children: ReactElement;
  defaultValues: Partial<DefaultEntityProps>;
  mutateList?: (e) => void;
  shortcutEnabled?: boolean;
}) => {
  const createTaskRef = useRef<BottomSheetModal>(null);
  const handleCreateTask = useCallback(
    () => createTaskRef.current?.present(),
    []
  );
  useHotkeys("shift+n", handleCreateTask, { enabled: shortcutEnabled });

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
