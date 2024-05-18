import { useColorTheme } from "@/ui/color/theme-provider";
import { Path, Svg } from "react-native-svg";

export default function MenuIcon() {
  const theme = useColorTheme();

  return (
    <Svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <Path
        fill={theme[11]}
        fillRule="evenodd"
        d="M3 8a1 1 0 0 1 1-1h16a1 1 0 1 1 0 1.3H4a1 1 0 0 1-1-1m0 8a1 1 0 0 1 1-1h10a1 1 0 1 1 0 1.3H4a1 1 0 0 1-1-1"
        clipRule="evenodd"
      />
    </Svg>
  );
}
