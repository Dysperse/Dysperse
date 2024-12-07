import { useColorTheme } from "@/ui/color/theme-provider";
import Svg, { Path } from "react-native-svg";

export default function MenuIcon() {
  const theme = useColorTheme();

  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill={theme[11]}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 8C4 7.77614 4.22386 7.5 4.5 7.5H19.5C19.7761 7.5 20 7.77614 20 8C20 8.22386 19.7761 8.5 19.5 8.5H4.5C4.22386 8.5 4 8.22386 4 8ZM4 16C4 15.7761 4.22386 15.5 4.5 15.5H13.5C13.7761 15.5 14 15.7761 14 16C14 16.2239 13.7761 16.5 13.5 16.5H4.5C4.22386 16.5 4 16.2239 4 16Z"
        fill={theme[11]}
      />
    </Svg>
  );
}

