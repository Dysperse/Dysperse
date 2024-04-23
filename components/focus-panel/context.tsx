import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import FocusPanel from "./panel";

interface FocusPanelContext {
  isFocused: boolean;
  setFocus: (isFocused: boolean) => void;
}

const FocusPanelContext = createContext<FocusPanelContext>(null);
export const useFocusPanelContext = () => useContext(FocusPanelContext);

export const FocusPanelProvider = ({ children }) => {
  const [isFocused, setFocus] = useState(
    Platform.OS === "web"
      ? localStorage.getItem("focusPanelVisible") === "true"
      : false
  );

  useEffect(() => {
    if (Platform.OS === "web")
      localStorage.setItem("focusPanelVisible", isFocused ? "true" : "false");
  }, [isFocused]);

  const breakpoints = useResponsiveBreakpoints();

  return (
    <FocusPanelContext.Provider value={{ isFocused, setFocus }}>
      {(breakpoints.md || !isFocused) && children}
      <FocusPanel />
    </FocusPanelContext.Provider>
  );
};

type Widget = "clock" | "weather";
interface FocusPanelWidgetContext {
  widgets: string[];
  setWidgets: Dispatch<React.SetStateAction<Widget[]>>;
}

const FocusPanelWidgetContext = createContext<FocusPanelWidgetContext>(null);
export const useFocusPanelWidgetContext = () =>
  useContext(FocusPanelWidgetContext);

export const FocusPanelWidgetProvider = ({ children }) => {
  const { sessionToken, session, mutate } = useUser();

  const widgets = session?.user?.profile?.widgets || [];

  const setWidgets = async (widgets: Widget[]) => {
    mutate(
      (session) => ({
        ...session,
        user: {
          ...session.user,
          profile: { ...session.user.profile, widgets },
        },
      }),
      {
        revalidate: false,
      }
    );
    sendApiRequest(
      sessionToken,
      "PUT",
      "user/profile",
      {},
      {
        body: JSON.stringify({ widgets }),
      }
    );
  };

  return (
    <FocusPanelWidgetContext.Provider value={{ widgets, setWidgets }}>
      {children}
    </FocusPanelWidgetContext.Provider>
  );
};
