import { useColorTheme } from "@/ui/color/theme-provider";
import { useEffect, useState } from "react";
import { getColors } from "react-native-image-colors";

export const useImageColors = (url) => {
  const theme = useColorTheme();
  const [colors, setColors] = useState(null);

  useEffect(() => {
    getColors(url, {
      fallback: theme[8],
      cache: true,
      key: url,
    }).then(setColors);
  }, [url, theme]);

  return colors;
};
