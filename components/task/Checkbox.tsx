import Icon from "@/ui/Icon";
import { useColorTheme } from "@/ui/color/theme-provider";
import React from "react";
import { Pressable } from "react-native";

export function TaskCheckbox({ completed }: { completed: boolean }) {
  const theme = useColorTheme();
  return (
    <Pressable
      style={({ pressed }) => ({
        borderColor: theme[completed ? 8 : pressed ? 8 : 6],
        width: 25,
        height: 25,
        borderRadius: 99,
        borderWidth: 2,
        backgroundColor: completed ? theme[8] : undefined,
        alignItems: "center",
      })}
    >
      {completed && (
        <Icon
          bold
          size={20}
          style={{
            lineHeight: 24.5,
            color: theme[1],
          }}
        >
          check
        </Icon>
      )}
    </Pressable>
  );
}
