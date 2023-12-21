import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import React from "react";
import { Pressable, StyleProp, View } from "react-native";

export function ButtonGroup({
  options,
  state,
  containerStyle = {},
}: {
  options: { label: string; value: string }[];
  state: [string, React.Dispatch<React.SetStateAction<string>>];
  containerStyle?: StyleProp<any>;
}) {
  const theme = useColorTheme();
  return (
    <View
      style={{
        borderRadius: 15,
        backgroundColor: theme[3],
        padding: 3,
        gap: 2,
        flexDirection: "row",
        ...containerStyle,
      }}
    >
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => state[1](option.value)}
          style={({ pressed, hovered }: any) => ({
            backgroundColor:
              state[0] === option.value
                ? theme[pressed ? 10 : 9]
                : theme[pressed ? 5 : hovered ? 4 : 3],
            borderRadius: 15,
            paddingHorizontal: 10,
            paddingVertical: 4.5,
            flex: 1,
          })}
        >
          <Text
            numberOfLines={1}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              fontFamily: "body_600",
              textAlign: "center",
              fontSize: 15,
            }}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
