import Text from "@/ui/Text";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Dimensions, Keyboard } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ComplexitySelector } from "./complexity-selection";
import { LocationSelector } from "./location-selection";
import { PhotoSelection } from "./photo-selection";
import { SubtaskCreation } from "./subtask-creation";

export function TaskAttachmentPicker({
  isTaskCreation,
  forceClose,
  handleBack,
}) {
  const SafeScrollView = forceClose ? BottomSheetScrollView : ScrollView;

  return (
    <SafeScrollView
      showsHorizontalScrollIndicator={false}
      style={{
        maxHeight: Dimensions.get("window").height - 300,
        paddingHorizontal: 15,
        paddingTop: 30,
        paddingBottom: isTaskCreation ? 10 : 30,
      }}
      onScrollBeginDrag={Keyboard.dismiss}
    >
      <Text variant="eyebrow" style={{ marginBottom: 5 }}>
        Photo
      </Text>
      <PhotoSelection handleBack={handleBack} />
      <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 35 }}>
        Location
      </Text>
      <LocationSelector handleBack={handleBack} />
      {!isTaskCreation && (
        <>
          <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 35 }}>
            Subtask
          </Text>
          <SubtaskCreation handleBack={handleBack} />
        </>
      )}

      <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 35 }}>
        Complexity
      </Text>
      <ComplexitySelector handleBack={handleBack} />
    </SafeScrollView>
  );
}
