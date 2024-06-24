import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { memo } from "react";
import { Pressable } from "react-native";
import CommandPaletteContent from "./content";
import { useCommandPaletteContext } from "./context";

const CommandPalette = memo(function CommandPalette() {
  const { handleClose, sheetRef, defaultFilter } = useCommandPaletteContext();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <BottomSheet
      enableContentPanningGesture={false}
      snapPoints={["100%"]}
      sheetRef={sheetRef}
      onClose={handleClose}
      maxWidth="100%"
      handleComponent={() => null}
      backgroundStyle={{
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...(breakpoints.md && {
        maxBackdropOpacity: 0,
        animationConfigs: {
          overshootClamping: true,
          duration: 0.0001,
        },
      })}
    >
      <Pressable onPress={handleClose} style={{ flex: 1 }}>
        <CommandPaletteContent
          defaultFilter={defaultFilter}
          handleClose={handleClose}
        />
      </Pressable>
    </BottomSheet>
  );
});

export default CommandPalette;
