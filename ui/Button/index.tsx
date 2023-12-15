import { Pressable } from "react-native";
import { PressableProps } from "react-native";

interface DButtonProps extends PressableProps {
  buttonClassName?: string;
  variant?: "filled" | "outlined" | "text";
}
export function Button(props: DButtonProps) {
  const variant = props.variant || "text";
  return (
    <Pressable
      {...props}
      className={`px-4 h-10 rounded-full flex-row items-center justify-center 
        ${props.buttonClassName} 
        ${variant === "filled" && "bg-gray-200 active:bg-gray-300"}
        `}
      style={{ gap: 10 }}
    />
  );
}
