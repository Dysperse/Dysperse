import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import CommandPalette from "./palette";

interface CommandPaletteContext {
  handleOpen: (defaultFilter?: string) => void;
  handleClose: () => void;
  sheetRef: React.MutableRefObject<BottomSheetModal>;
  defaultFilter: string;
}

export const CommandPaletteContext = createContext<CommandPaletteContext>(null);
export const useCommandPaletteContext = () => useContext(CommandPaletteContext);

export const CommandPaletteProvider = ({ children }) => {
  const breakpoints = useResponsiveBreakpoints();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [defaultFilter, setDefaultFilter] = useState<string | null>(null);

  const handleOpen = useCallback(
    (filter?: string) => {
      if (typeof filter === "string") setDefaultFilter(filter);
      if (breakpoints.md) sheetRef.current?.present();
      else router.push("/open");
    },
    [breakpoints, setDefaultFilter]
  );

  const handleClose = useCallback(() => {
    if (defaultFilter) setDefaultFilter(null);
    if (breakpoints.md) sheetRef.current?.close();
    else router.back();
  }, [breakpoints, setDefaultFilter, defaultFilter]);

  const value = useMemo(
    () => ({ handleOpen, handleClose, sheetRef, defaultFilter }),
    [handleOpen, handleClose, sheetRef, defaultFilter]
  );
  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette />
    </CommandPaletteContext.Provider>
  );
};

