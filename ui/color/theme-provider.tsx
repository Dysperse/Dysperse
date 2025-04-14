import React, { createContext, useContext, useEffect } from "react";
import { Platform } from "react-native";

const ColorThemeContext = createContext(null);
export const useColorTheme = () => useContext(ColorThemeContext);

export const ColorThemeProvider = ({
  theme,
  children,
  setHTMLAttributes = false,
}: {
  theme: Record<string, string>;
  children: React.ReactNode;
  setHTMLAttributes?: boolean;
}) => {
  useEffect(() => {
    if (Platform.OS === "web" && setHTMLAttributes) {
      const variables = Object.entries(theme).map(
        ([key, value]) => `--theme-${key}: ${value};`
      );
      document.documentElement.style.cssText = variables.join(" ");
    }
  }, [theme, setHTMLAttributes]);

  return (
    <ColorThemeContext.Provider value={theme}>
      {children}
    </ColorThemeContext.Provider>
  );
};
