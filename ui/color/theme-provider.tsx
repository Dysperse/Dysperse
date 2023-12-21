import React, { createContext, useContext } from "react";

const ColorThemeContext = createContext(null);
export const useColorTheme = () => useContext(ColorThemeContext);

export const ColorThemeProvider = ({
  theme,
  children,
}: {
  theme: Record<string, string>;
  children: React.ReactNode;
}) => {
  return (
    <ColorThemeContext.Provider value={theme}>
      {children}
    </ColorThemeContext.Provider>
  );
};
