import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { FlashList, FlashListProps } from "@shopify/flash-list";

export default function BottomSheetFlashList(props: FlashListProps<any>) {
  return <FlashList {...props} renderScrollComponent={BottomSheetScrollView} />;
}
