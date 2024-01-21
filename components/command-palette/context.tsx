import { BottomSheetModal } from "@gorhom/bottom-sheet";
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
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.dismiss(), []);

  return (
    <CommandPaletteContext.Provider
      value={{ handleOpen, handleClose, sheetRef: ref }}
    >
      {children}
      <CommandPalette />
    </CommandPaletteContext.Provider>
  );
};
