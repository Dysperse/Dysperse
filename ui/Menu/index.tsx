import BottomSheet from "@/ui/BottomSheet";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, {
  ReactElement,
  Ref,
  cloneElement,
  useCallback,
  useRef,
} from "react";
import { View } from "react-native";

export function Menu({
  trigger,
  children,
  height = ["30%"],
  footer = () => null,
  menuRef = null,
  onOpen = () => null,
  onClose = () => null,
  width = 500,
}: {
  trigger: ReactElement;
  children: React.ReactNode;
  height: (string | number)[];
  footer?: () => React.ReactNode;
  menuRef?: Ref<BottomSheetModal>;
  onOpen?: () => void;
  onClose?: () => void;
  width?: number;
}) {
  const theme = useColorTheme();
  const _ref = useRef<BottomSheetModal>(null);
  const ref: any = menuRef || _ref;
  const handleOpen = useCallback(() => {
    ref.current?.present();
    onOpen();
  }, [ref, onOpen]);

  const handleClose = useCallback(() => {
    ref.current?.close();
    onClose();
  }, [ref, onClose]);

  const _trigger = cloneElement(trigger, { onPress: handleOpen });

  return (
    <>
      {_trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={height}
        stackBehavior="push"
        keyboardBlurBehavior="none"
        backgroundStyle={{
          backgroundColor: "transparent",
        }}
        detached
        footerComponent={footer}
        bottomInset={23.5}
      >
        <View
          style={{
            paddingHorizontal: 23.5,
          }}
        >
          <View
            style={{
              borderRadius: 20,
              paddingVertical: 20,
              backgroundColor: theme[1],
            }}
          >
            {children}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
