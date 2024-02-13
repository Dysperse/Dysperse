import { createContext, useContext } from "react";

export const SidebarContext = createContext<{
  isOpen: boolean;
  closeSidebar: () => void;
  openSidebar: () => void;
  closeSidebarOnMobile: () => void;

  desktopCollapsed: boolean;
  setDesktopCollapsed: (value: boolean) => void;

  SIDEBAR_WIDTH: any;
}>(null);

export const useSidebarContext = () => useContext(SidebarContext);
