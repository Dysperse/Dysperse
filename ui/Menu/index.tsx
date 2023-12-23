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
import { useWindowDimensions } from "react-native";

export function Menu({
  trigger,
  children,
  height = ["30%"],
  footer = () => null,
  menuRef = null,
}: {
  trigger: ReactElement;
  children: React.ReactNode;
  height: (string | number)[];
  footer?: () => React.ReactNode;
  menuRef?: Ref<BottomSheetModal>;
}) {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const _ref = useRef<BottomSheetModal>(null);
  const ref: any = menuRef || _ref;
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const _trigger = cloneElement(trigger, { onPress: handleOpen });

  return (
    <>
      {_trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={height}
        containerStyle={{
          marginHorizontal: 20,
        }}
        backgroundStyle={{
          borderRadius: 20,
          backgroundColor: theme[1],
        }}
        detached
        footerComponent={footer}
        bottomInset={23.5}
      >
        {children}
      </BottomSheet>
    </>
  );
}
