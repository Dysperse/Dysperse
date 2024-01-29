import { createContext, useContext } from "react";

export const SidebarContext = createContext<{
  SIDEBAR_WIDTH: any;
  sidebarMargin: any;
  closeSidebarOnMobile: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}>(null);

export const useSidebarContext = () => useContext(SidebarContext);
