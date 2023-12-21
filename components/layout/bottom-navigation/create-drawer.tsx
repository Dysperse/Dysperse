import BottomSheet from "@/ui/BottomSheet";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { cloneElement, useCallback, useRef } from "react";
import { View } from "react-native";
import CreateTask from "../../task/create";

export const CreateDrawer = ({ children }) => {
  const ref = useRef<BottomSheetModal>(null);

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <View>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        snapPoints={[305]}
        style={{ maxWidth: 350, marginHorizontal: "auto" }}
        onClose={handleClose}
      >
        <View className="p-5">
          {[
            {
              name: "Task",
              icon: "check_circle",
              callback: () => {},
              Wrapper: (p) => <CreateTask showClose>{p.children}</CreateTask>,
            },
            { name: "Item", icon: "package_2", callback: () => {} },
            { name: "Note", icon: "sticky_note_2", callback: () => {} },
            { name: "Collection", icon: "interests", callback: () => {} },
            {
              name: "Tab",
              icon: "tab",
              callback: () => router.push("/open"),
            },
          ].map(
            ({
              Wrapper = (p) => <React.Fragment {...p} />,
              callback,
              icon,
              name,
            }) => (
              <Wrapper key={name}>
                <ListItemButton
                  onPress={() => {
                    callback();
                    handleClose();
                  }}
                >
                  <View>
                    <Icon size={30} style={{ marginLeft: 1 }}>
                      {icon}
                    </Icon>
                  </View>
                  <ListItemText primary={name} />
                </ListItemButton>
              </Wrapper>
            )
          )}
        </View>
      </BottomSheet>
    </View>
  );
};
