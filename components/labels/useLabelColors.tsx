import { useColor } from "@/ui/color";
import { useColorScheme } from "react-native";

export const useLabelColors = () => {
  const red = useColor("red", useColorScheme() === "dark");
  const orange = useColor("orange", useColorScheme() === "dark");
  const yellow = useColor("yellow", useColorScheme() === "dark");
  const green = useColor("green", useColorScheme() === "dark");
  const blue = useColor("blue", useColorScheme() === "dark");
  const purple = useColor("purple", useColorScheme() === "dark");
  const pink = useColor("pink", useColorScheme() === "dark");
  const brown = useColor("brown", useColorScheme() === "dark");
  const mint = useColor("mint", useColorScheme() === "dark");
  const gray = useColor("gray", useColorScheme() === "dark");

  const colors = {
    red,
    orange,
    yellow,
    green,
    blue,
    purple,
    pink,
    brown,
    mint,
    gray,
  };

  return colors;
};
