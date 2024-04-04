import { useUser } from "@/context/useUser";
import { useMemo } from "react";
import { useColorScheme } from "react-native";
import * as colors from "../../themes";

/**
 * Returns true if system is dark, or if setting is dark.
 * @param setting Required. "light" | "dark" | "system"
 * @returns
 */
export function useDarkMode(): boolean {
  const { session } = useUser() || {};
  const system = useColorScheme() === "dark";
  const setting = session?.user?.profile?.darkMode || "system";

  return useMemo(() => {
    if (setting === "system") {
      return system;
    } else {
      return setting === "dark";
    }
  }, [setting, system]);
}

export const addHslAlpha = (hsl: string, alpha: number) =>
  hsl.replace(")", `, ${alpha})`).replace("hsl", "hsla");

/**
 * Returns a color palette.
 * @param base Base color from radix-ui/colors
 * @param dark True if dark mode
 * @returns Color palette
 */

export function useColor(base: keyof typeof colors, forceMode?: boolean) {
  const isDark = useDarkMode();

  const getColorPalette = useMemo(() => {
    const paletteKey =
      typeof forceMode === "boolean"
        ? forceMode
          ? `${base}Dark`
          : base
        : isDark
        ? `${base}Dark`
        : base;

    const colorPalette = colors[paletteKey];
    const _colorPalette: Record<string, string> = {};

    for (const key in colorPalette) {
      if (key.includes(base)) {
        const index = parseInt(key.replace(base, ""));
        _colorPalette[index] = colorPalette[key];
      }
    }

    return _colorPalette;
  }, [base, isDark]);

  return getColorPalette;
}
