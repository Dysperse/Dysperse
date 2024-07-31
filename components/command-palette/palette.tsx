import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Modal } from "@/ui/Modal";
import { memo } from "react";
import { useWindowDimensions } from "react-native";
import CommandPaletteContent from "./content";
import { useCommandPaletteContext } from "./context";

const CommandPalette = memo(function CommandPalette() {
  const { handleClose, sheetRef, defaultFilter } = useCommandPaletteContext();
  const breakpoints = useResponsiveBreakpoints();
  const { height, width } = useWindowDimensions();

  return (
    <Modal
      ref={sheetRef}
      animation="NONE"
      containerHeight={Math.min(600, height / 1.3)}
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
