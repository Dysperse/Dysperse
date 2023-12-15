import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import React from "react";

export const BottomSheetBackdropComponent = (props) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.25}
  />
);
