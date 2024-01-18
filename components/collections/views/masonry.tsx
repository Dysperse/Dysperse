import { useCollectionContext } from "@/components/collections/context";
import CreateTask from "@/components/task/create";
import { useKeyboardShortcut } from "@/helpers/useKeyboardShortcut";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { MasonryFlashList } from "@shopify/flash-list";
import { ReactElement, useCallback, useRef } from "react";
import { View } from "react-native";
import { MenuProps } from "react-native-popup-menu";
import { Entity } from "../entity";

export const CreateEntityTrigger = ({
  children,
  menuProps,
}: {
  children: ReactElement;
  menuProps?: MenuProps;
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
        ]}
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

export function Masonry() {
  const { data } = useCollectionContext();

  const flattened = data.labels
    .reduce((acc, curr) => [...acc, ...curr.entities], [])
    .sort(
      (a, b) => a.completionInstances.length - b.completionInstances.length
    );

  useKeyboardShortcut(["c o", "c n", "c i"], (shortcut) =>
    alert("create " + shortcut.split(" ")[1])
  );

  return (
    <View
      style={{
        width: "100%",
        maxWidth: 900,
        marginHorizontal: "auto",
        paddingTop: 100,
      }}
    >
      <MasonryFlashList
        ListHeaderComponent={
          <View
            style={{
              padding: 10,
              marginBottom: 20,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <CreateEntityTrigger>
              <Button
                disabled
                variant="filled"
                style={{ height: 70, paddingHorizontal: 40 }}
              >
                <Icon size={35}>add</Icon>
                <ButtonText style={{ fontSize: 20 }}>New</ButtonText>
              </Button>
            </CreateEntityTrigger>
          </View>
        }
        renderItem={({ item }) => (
          <Entity
            onTaskUpdate={() => alert("something updated ")}
            openColumnMenu={() => alert("open column menu")}
            item={item}
          />
        )}
        data={flattened}
        keyExtractor={(i: any) => i.id}
        numColumns={2}
      />
    </View>
  );
}
