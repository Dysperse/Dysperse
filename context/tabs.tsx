import { createContext, useContext, useMemo, useState } from "react";

// Create a context for managing active tabs
const TabContext = createContext({
  activeTab: null,
  setActiveTab: (e) => {},
});

// Custom hook for accessing the active tab context
export const useOpenTab = () => useContext(TabContext);

// Provider component for managing open tabs
export const OpenTabsProvider = ({ children }) => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState<null | string>(null);

  // Memoize the context value to avoid unnecessary renders
  const value = useMemo(
    () => ({ activeTab, setActiveTab }),
    [activeTab, setActiveTab]
  );

  // Provide the context value to the child components
  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};
