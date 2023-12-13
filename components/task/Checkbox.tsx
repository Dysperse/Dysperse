import React from "react";
import { Pressable } from "react-native";

export function TaskCheckbox({ completed }: { completed: boolean }) {
  return (
    <Pressable className="w-7 h-7 border-2 border-gray-400 active:bg-gray-100 rounded-full"></Pressable>
  );
}
