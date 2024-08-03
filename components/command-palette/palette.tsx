import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useDarkMode } from "@/ui/color";
import { Modal } from "@/ui/Modal";
import { BlurView } from "expo-blur";
import { memo } from "react";
import { useWindowDimensions } from "react-native";
import CommandPaletteContent from "./content";
import { useCommandPaletteContext } from "./context";

const CommandPalette = memo(function CommandPalette() {
  const { handleClose, sheetRef, defaultFilter } = useCommandPaletteContext();
  const breakpoints = useResponsiveBreakpoints();
  const isDark = useDarkMode();
  const { height, width } = useWindowDimensions();

  return (
    <Modal
      ref={sheetRef}
      animation="SCALE"
      containerHeight={Math.min(600, height / 1.3)}
      maxBackdropOpacity={isDark ? 0.3 : undefined}
      maxWidth={breakpoints.md ? 900 : width}
      innerStyles={{
        backgroundColor: "transparent",
      }}
    >
      <BlurView
        style={{ flex: 1 }}
        intensity={60}
        tint={
          isDark
            ? "systemUltraThinMaterialDark"
            : "systemUltraThinMaterialLight"
        }
      >
        <CommandPaletteContent
          defaultFilter={defaultFilter}
          handleClose={handleClose}
        />
      </BlurView>
    </Modal>
  );
});

export default CommandPalette;
