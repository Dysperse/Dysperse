import { BottomSheetModal, BottomSheetProps } from "@gorhom/bottom-sheet";
import { BottomSheetBackHandler } from "./BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "./BottomSheetBackdropComponent";
import { useColorTheme } from "../color/theme-provider";
import { Ref } from "react";

interface DBottomSheetProps extends BottomSheetProps {
  sheetRef: Ref<BottomSheetModal>;
  onClose: () => void;
}

export default function BottomSheet(props: DBottomSheetProps) {
  const theme = useColorTheme();

  return (
    <BottomSheetModal
      ref={props.sheetRef}
      backdropComponent={BottomSheetBackdropComponent}
      backgroundStyle={{
        backgroundColor: theme[1],
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
      }}
      handleIndicatorStyle={{ backgroundColor: theme[5] }}
      {...props}
    >
      <BottomSheetBackHandler handleClose={props.onClose} />
      {props.children}
    </BottomSheetModal>
  );
}
