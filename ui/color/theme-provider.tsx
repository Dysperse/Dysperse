import { createContext, useContext } from "react";

const ColorThemeContext = createContext(null);
export const useColorTheme = () => useContext(ColorThemeContext);

export const ColorThemeProvider = ({ theme, children }) => {
  return (
    <ColorThemeContext.Provider value={theme}>
      {children}
    </ColorThemeContext.Provider>
  );
};
