import React, { createContext, useContext, useEffect } from "react";
import { Platform } from "react-native";

const ColorThemeContext = createContext(null);
export const useColorTheme = () => useContext(ColorThemeContext);

export const ColorThemeProvider = ({
  theme,
  children,
}: {
  theme: Record<string, string>;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (Platform.OS === "web") {
      const variables = Object.entries(theme).map(
        ([key, value]) => `--theme-${key}: ${value};`
      );
      document.body.style.cssText = variables.join(" ");
    }
  });
  return (
    <ColorThemeContext.Provider value={theme}>
      {children}
    </ColorThemeContext.Provider>
  );
};
