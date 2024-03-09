import { useColor } from "@/ui/color";

export const useLabelColors = () => {
  const red = useColor("red");
  const orange = useColor("orange");
  const yellow = useColor("yellow");
  const green = useColor("green");
  const blue = useColor("blue");
  const purple = useColor("purple");
  const pink = useColor("pink");
  const brown = useColor("brown");
  const mint = useColor("mint");
  const gray = useColor("gray");

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
