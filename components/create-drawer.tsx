import BottomSheet from "@/ui/BottomSheet";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { cloneElement, useCallback, useRef } from "react";
import { Pressable, View } from "react-native";
import CreateTask from "./perspectives/agenda/CreateTask";

export const CreateDrawer = ({ children }) => {
  const ref = useRef<BottomSheetModal>(null);

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <View>
      {trigger}
      <BottomSheet sheetRef={ref} snapPoints={[305]} onClose={handleClose}>
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
                <Pressable
                  className="flex-row items-center p-2.5 rounded-2xl active:bg-gray-300"
                  style={{ gap: 20 }}
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
                  <Text>{name}</Text>
                </Pressable>
              </Wrapper>
            )
          )}
        </View>
      </BottomSheet>
    </View>
  );
};
