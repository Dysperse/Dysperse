import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useDarkMode } from "@/ui/color";
import Modal from "@/ui/Modal";
import { useWindowDimensions } from "react-native";
import CommandPaletteContent from "./content";
import { useCommandPaletteContext } from "./context";

export default function CommandPalette() {
  const { handleClose, sheetRef, defaultFilter } = useCommandPaletteContext();
  const breakpoints = useResponsiveBreakpoints();
  const isDark = useDarkMode();
  const { height, width } = useWindowDimensions();

  return (
    <Modal
      sheetRef={sheetRef}
      animation="SCALE"
      height={"100%"}
      innerStyles={{
        ...(breakpoints.md && { height }),
        maxHeight: Math.min(600, height / 1.3),
      }}
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
}

