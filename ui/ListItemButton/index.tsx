import { Pressable } from "react-native";
import { PressableProps } from "react-native";
import { StyleProp } from "react-native";
import { useColorTheme } from "../color/theme-provider";

export interface DListitemButtonProps extends PressableProps {
  wrapperStyle?: StyleProp<any>;
  buttonClassName?: string;
}

export function ListItemButton(props: DListitemButtonProps) {
  const theme = useColorTheme();

  return (
    <Pressable
      {...props}
      style={({ pressed, hovered }: any) => ({
        gap: 15,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: pressed
          ? theme[5]
          : hovered
          ? theme[4]
          : "transparent",
        paddingHorizontal: 20,
        paddingVertical: 15,
        ...props.wrapperStyle,
      })}
      // className={`px-4 py-2 items-center hover:bg-gray-100 active:bg-gray-200 rounded-2xl flex-row justify-start ${props.buttonClassName}`}
    />
  );
}
