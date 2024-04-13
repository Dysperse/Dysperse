import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useEffect, useState } from "react";
import { getGreeting } from "../../app/(app)";

export function Greeting() {
  const theme = useColorTheme();
  const [greeting, setGreeting] = useState(getGreeting());
  const breakpoints = useResponsiveBreakpoints();

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <Text
      weight={900}
      numberOfLines={1}
      style={{
        color: theme[12],
        fontSize: breakpoints.md ? 40 : 30,
        marginBottom: 10,
      }}
    >
      {greeting}
    </Text>
  );
}
