import {
  Dispatch,
  RefObject,
  SetStateAction,
  createContext,
  useContext,
} from "react";
import { DrawerLayout } from "react-native-gesture-handler";

export const SidebarContext = createContext<{
  sidebarRef: RefObject<DrawerLayout>;

  desktopCollapsed: boolean;
  setDesktopCollapsed: Dispatch<SetStateAction<boolean>>;

  SIDEBAR_WIDTH: any;
}>(null);

export const useSidebarContext = () => useContext(SidebarContext);
