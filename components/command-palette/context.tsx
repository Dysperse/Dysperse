import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { createContext, useCallback, useContext, useRef } from "react";
import CommandPalette from "./palette";

interface CommandPaletteContext {
  handleOpen: () => void;
  handleClose: () => void;
  sheetRef: React.MutableRefObject<BottomSheetModal>;
}

export const CommandPaletteContext = createContext<CommandPaletteContext>(null);
export const useCommandPaletteContext = () => useContext(CommandPaletteContext);

export const CommandPaletteProvider = ({ children }) => {
  const breakpoints = useResponsiveBreakpoints();
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => {
    if (breakpoints.md) ref.current?.present();
    else router.push("/open");
  }, [breakpoints]);

  const handleClose = useCallback(() => {
    if (breakpoints.md) ref.current?.close();
    else router.back();
  }, [breakpoints]);

  return (
    <CommandPaletteContext.Provider
      value={{ handleOpen, handleClose, sheetRef: ref }}
    >
      {children}
      <CommandPalette />
    </CommandPaletteContext.Provider>
  );
};
