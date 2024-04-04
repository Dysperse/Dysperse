import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function Page() {
  const theme = useColorTheme();
  const handleNext = () => router.back();

  return (
    <LinearGradient
      colors={[theme[1], theme[2], theme[3], theme[4], theme[5], theme[6]]}
      style={{ flex: 1 }}
    ></LinearGradient>
  );
}
