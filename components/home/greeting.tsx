import { getGreeting } from "@/components/home/getGreeting";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useEffect, useState } from "react";

export function Greeting() {
  const theme = useColorTheme();
  const [greeting, setGreeting] = useState(getGreeting());
  const breakpoints = useResponsiveBreakpoints();

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <Text
      numberOfLines={1}
      style={{
        fontFamily: "serifText800",
        color: theme[11],
        fontSize: breakpoints.md ? 45 : 30,
        textAlign: "center",
        marginBottom: 10,
      }}
    >
      {greeting}
    </Text>
  );
}
