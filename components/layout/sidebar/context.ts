import {
  Dispatch,
  RefObject,
  SetStateAction,
  createContext,
  useContext,
} from "react";

export const SidebarContext = createContext<{
  sidebarRef: RefObject<any>;
  focusPanelRef?: RefObject<any>;

  desktopCollapsed: boolean;
  setDesktopCollapsed: Dispatch<SetStateAction<boolean>>;

  SIDEBAR_WIDTH: any;
  ORIGINAL_SIDEBAR_WIDTH: number;
  SECONDARY_SIDEBAR_WIDTH: number;
}>(null);

export const useSidebarContext = () => useContext(SidebarContext);

