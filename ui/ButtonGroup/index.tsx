import { useColorTheme } from "@/ui/color/theme-provider";
import React from "react";
import { Pressable, StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ButtonText } from "../Button";
import Icon from "../Icon";
import Text from "../Text";

export function ButtonGroup({
  options,
  state,
  containerStyle = {},
  buttonStyle = {},
  selectedButtonStyle = {},
  buttonTextStyle = {},
  selectedButtonTextStyle = {},
  scrollContainerStyle = {},
  activeComponent = null,
  iconStyle = {},
  selectedIconStyle = {},
}: {
  options: { label?: string; icon?: string; value: string }[];
  state: [string, React.Dispatch<React.SetStateAction<string>>];
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  selectedButtonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  selectedButtonTextStyle?: StyleProp<TextStyle>;
  scrollContainerStyle?: StyleProp<ViewStyle>;
  activeComponent?: React.ReactNode;
  iconStyle?: StyleProp<TextStyle>;
  selectedIconStyle?: StyleProp<TextStyle>;
}) {
  const theme = useColorTheme();
  return (
    <View style={[{ width: "100%" }, containerStyle]}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        style={[{ width: "100%" }]}
        contentContainerStyle={[{ flexDirection: "row" }, scrollContainerStyle]}
      >
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => state[1](option.value)}
            style={[
              {
                flexShrink: 0,
                borderRadius: 0,
                backgroundColor: "transparent",
                borderBottomWidth: 2,
                borderBottomColor: theme[state[0] === option.value ? 11 : 3],
                paddingHorizontal: 10,
                paddingVertical: 4.5,
                flex: 1,
              },
              buttonStyle,
              state[0] === option.value && selectedButtonStyle,
            ]}
          >
            {option.icon && (
              <Text style={buttonTextStyle}>
                <Icon
                  filled={state[0] === option.value}
                  size={26}
                  style={[
                    iconStyle,
                    state && state[0] === option.value && selectedIconStyle,
                  ]}
                >
                  {option.icon}
                </Icon>
              </Text>
            )}
            {option.label && (
              <ButtonText
                numberOfLines={1}
                style={[
                  {
                    color: theme[11],
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
            )}
            {option.value === state[0] && activeComponent}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
