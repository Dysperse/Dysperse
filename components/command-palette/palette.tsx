import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useDarkMode } from "@/ui/color";
import Modal from "@/ui/Modal";
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
      sheetRef={sheetRef}
      animation="SCALE"
      height={Math.min(600, height / 1.3)}
      maxBackdropOpacity={isDark ? 0.3 : undefined}
      animationConfigs={{ duration: 0.0001 }}
      maxWidth={breakpoints.md ? 900 : width}
    >
      <CommandPaletteContent
        defaultFilter={defaultFilter}
        handleClose={handleClose}
      />
    </Modal>
  );
});

export default CommandPalette;

