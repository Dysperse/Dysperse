import { useEffect } from "react";
import { Platform } from "react-native";

export default function WindowTitle({ title }) {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = `${title} • Dysperse`;
    }
    return () => {
      document.title = "Dysperse";
    };
  });
  return null;
}
