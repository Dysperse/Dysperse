import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
import Icon from "@/ui/Icon";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { cloneElement, useCallback, useRef } from "react";
import { Pressable, View } from "react-native";
import Text from "@/ui/Text";

export const CreateDrawer = ({ children }) => {
  const ref = useRef<BottomSheetModal>(null);

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <View>
      {trigger}
      <BottomSheetModal
        ref={ref}
        snapPoints={[305]}
        backdropComponent={BottomSheetBackdropComponent}
      >
        <BottomSheetBackHandler handleClose={handleClose} />
        <View className="p-5">
          {[
            { name: "Task", icon: "check_circle", callback: () => {} },
            { name: "Item", icon: "package_2", callback: () => {} },
            { name: "Note", icon: "sticky_note_2", callback: () => {} },
            { name: "Collection", icon: "interests", callback: () => {} },
            {
              name: "Tab",
              icon: "tab",
              callback: () => router.push("/open"),
            },
          ].map((button) => (
            <Pressable
              className="flex-row items-center p-2.5 rounded-2xl active:bg-gray-300"
              style={{ gap: 20 }}
              key={button.name}
              onPress={() => {
                button.callback();
                handleClose();
              }}
            >
              <View>
                <Icon size={30} style={{ marginLeft: 1 }}>
                  {button.icon}
                </Icon>
              </View>
              <Text>{button.name}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheetModal>
    </View>
  );
};
