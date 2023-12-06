import { createContext, useContext, useMemo, useState } from "react";

type Tab = {
  id: string;
  href: string;
};

const TabContext = createContext([]);
export const useOpenTabs = () => useContext(TabContext);

const OpenTabsProvider = ({ children }) => {
  const [openTabs, setOpenTabs] = useState([]);
  const value = useMemo(() => [openTabs, setOpenTabs], [openTabs]);
  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};
