import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import React from "react";
import { Pressable, StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { ButtonText } from "../Button";

export function ButtonGroup({
  options,
  state,
  containerStyle = {},
  buttonStyle = {},
  selectedButtonStyle = {},
  buttonTextStyle = {},
  selectedButtonTextStyle = {},
}: {
  options: { label: string; value: string }[];
  state: [string, React.Dispatch<React.SetStateAction<string>>];
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  selectedButtonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  selectedButtonTextStyle?: StyleProp<TextStyle>;
}) {
  const theme = useColorTheme();
  return (
    <View
      style={[
        {
          borderRadius: 15,
          backgroundColor: theme[3],
          padding: 3,
          gap: 2,
          flexDirection: "row",
        },
        containerStyle,
      ]}
    >
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => state[1](option.value)}
          style={({ pressed, hovered }: any) => [
            {
              backgroundColor:
                state[0] === option.value
                  ? theme[pressed ? 10 : 9]
                  : theme[pressed ? 5 : hovered ? 4 : 3],
              borderRadius: 15,
              paddingHorizontal: 10,
              paddingVertical: 4.5,
              flex: 1,
            },
            buttonStyle,
            state[0] === option.value && selectedButtonStyle,
          ]}
        >
          <ButtonText
            numberOfLines={1}
            style={[
              {
                paddingHorizontal: 10,
                paddingVertical: 5,
                fontFamily: "body_600",
                textAlign: "center",
                justifyContent: "center",
                fontSize: 15,
              },
              buttonTextStyle,
              state[0] === option.value && selectedButtonTextStyle,
            ]}
          >
            {option.label}
          </ButtonText>
        </Pressable>
      ))}
    </View>
  );
}
