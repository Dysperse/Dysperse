import { Dispatch, SetStateAction, createContext, useContext } from "react";

export const SidebarContext = createContext<{
  isOpen: boolean;
  closeSidebar: () => void;
  openSidebar: () => void;
  closeSidebarOnMobile: () => void;

  desktopCollapsed: boolean;
  setDesktopCollapsed: Dispatch<SetStateAction<boolean>>;

  SIDEBAR_WIDTH: any;
}>(null);

export const useSidebarContext = () => useContext(SidebarContext);
