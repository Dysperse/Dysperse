import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { View } from "react-native";
import useSWR from "swr";
import { useCollectionContext } from "../context";

const Header = () => (
  <View
    style={{
      padding: 25,
    }}
  >
    <Text weight={600} style={{ fontSize: 30, marginBottom: 5 }}>
      Integrations
    </Text>
    <Text variant="eyebrow">Unsynced changes</Text>
  </View>
);

const DiffList = ({ collectionId, integration }) => {
  const { data, error } = useSWR([
    "space/integrations/diff",
    { id: integration.id, collectionId },
  ]);

  return (
    <View
      style={{
        padding: 25,
        paddingTop: 0,
      }}
    >
      <Text>{JSON.stringify(integration, null, 2)}</Text>
    </View>
  );
};

export function CollectionIntegrationsMenu() {
  const { data } = useCollectionContext();
  const ref = useRef<BottomSheetModal>(null);
  const breakpoints = useResponsiveBreakpoints();

  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);

  // this is a popup which shows the new changes in the integrations and the user can make it up to date
  return (
    data.integration && (
      <>
        <IconButton
          onPress={handleOpen}
          variant="outlined"
          size={breakpoints.md ? 50 : 40}
          style={breakpoints.md && { borderRadius: 20 }}
          icon="conversion_path"
        />
        <BottomSheet onClose={handleClose} sheetRef={ref} snapPoints={["90%"]}>
          <BottomSheetScrollView>
            <Header />
            <DiffList collectionId={data.id} integration={data.integration} />
          </BottomSheetScrollView>
        </BottomSheet>
      </>
    )
  );
}
