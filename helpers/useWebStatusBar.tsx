import { useEffect } from "react";
import { Platform } from "react-native";

export const useWebStatusBar = ({ active, cleanup }) => {
  useEffect(() => {
    if (Platform.OS === "web") {
      document
        .querySelector(`meta[name="theme-color"]`)
        .setAttribute("content", active);
      return () => {
        document
          .querySelector(`meta[name="theme-color"]`)
          .setAttribute("content", cleanup);
      };
    }
  }, [active, cleanup]);
};
