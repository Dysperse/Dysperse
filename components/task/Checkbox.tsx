import { useColorTheme } from "@/ui/color/theme-provider";
import React from "react";
import { Pressable } from "react-native";

export function TaskCheckbox({ completed }: { completed: boolean }) {
  const theme = useColorTheme();
  return (
    <Pressable
      style={({ pressed }) => ({
        borderColor: theme[pressed ? 12 : 11],
        width: 30,
        height: 30,
        borderRadius: 99,
        borderWidth: 2,
      })}
    ></Pressable>
  );
}
