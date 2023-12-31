import { useWindowDimensions } from "react-native";

import { useMemo } from "react";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};

interface BreakpointsObject {
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  xxl: boolean;
}

export const useResponsiveBreakpoints = (): BreakpointsObject => {
  const { width } = useWindowDimensions();

  const matches = useMemo(() => {
    const matches = {};
    for (const [key, value] of Object.entries(breakpoints)) {
      matches[key] = width > value;
    }
    return matches;
  }, [width]);

  return matches as BreakpointsObject;
};
