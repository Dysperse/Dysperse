import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Platform } from "react-native";

export const SafeFlashListFix =
  Platform.OS === "web" ? FlashList : BottomSheetFlatList;

