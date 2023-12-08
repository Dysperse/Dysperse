import { Pressable, PressableProps } from "react-native";

export default function IconButton(props: PressableProps) {
  return (
    <Pressable
      {...props}
      className={`w-10 h-10 active:bg-gray-200 items-center justify-center rounded-full ${props.className}`}
    />
  );
}
