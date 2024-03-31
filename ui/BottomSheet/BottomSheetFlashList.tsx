import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { FlashList, FlashListProps } from "@shopify/flash-list";
import React, { forwardRef } from "react";

const BottomSheetFlashList = forwardRef<any, FlashListProps<any>>(
  (props, ref) => {
    return (
      <FlashList
        {...props}
        renderScrollComponent={BottomSheetScrollView as any}
        ref={ref}
      />
    );
  }
);

export default BottomSheetFlashList;
