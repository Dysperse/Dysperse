import { LinearGradient } from "expo-linear-gradient";
import React, { ReactElement } from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptionProps,
  MenuOptions,
  MenuProps as MenuPropsType,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";
import Icon from "../Icon";
import Text from "../Text";
import { useColorTheme } from "../color/theme-provider";

type MenuOption = MenuOptionProps & {
  icon: string;
  text: string;
  callback?;
  selected?: boolean;
  renderer?: (children) => ReactElement;
};
export interface MenuProps {
  trigger: ReactElement;
  options: MenuOption[];
  menuProps?: MenuPropsType;
  containerStyle?: StyleProp<ViewStyle>;
}

export function MenuItem(
  props: PressableProps & { removeExtraStyles?: boolean }
) {
  const theme = useColorTheme();
  return (
    <Pressable
      {...props}
      style={({ pressed, hovered }: any) => [
        {
          backgroundColor: pressed ? theme[5] : hovered ? theme[6] : undefined,
          borderRadius: 20,
          zIndex: 2,
        },
        !props.removeExtraStyles && {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 15,
          paddingVertical: 10,
          gap: 13,
        },
        props.style,
      ]}
    />
  );
}

export default function MenuPopover({
  trigger,
  options,
  menuProps,
  containerStyle,
}: MenuProps) {
  const theme = useColorTheme();

  return (
    <Menu
      {...menuProps}
      rendererProps={{
        openAnimationDuration: 0,
        closeAnimationDuration: 0,
        preferredPlacement: "bottom",
        anchorStyle: {
          backgroundColor: theme[3],
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderColor: theme[6],
          zIndex: 1,
          width: 5,
          height: 5,
          marginBottom: 8,
          
        },
        ...menuProps?.rendererProps,
      }}
      renderer={renderers.Popover}
    >
      <MenuTrigger>{trigger}</MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: {
            width: 180,
            borderWidth: 1,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: theme[3],
            borderColor: theme[6],
            shadowColor: theme[11],
            ...(containerStyle as any),
          },
        }}
      >
        <LinearGradient colors={[theme[3], theme[4]]} style={{ padding: 3 }}>
          {options.map(
            ({
              icon,
              text,
              callback,
              renderer: Renderer = React.Fragment,
              ...props
            }) => (
              <Renderer key={text}>
                <MenuOption
                  key={text}
                  onSelect={callback}
                  customStyles={{
                    OptionTouchableComponent: (props) => (
                      <MenuItem {...props} removeExtraStyles />
                    ),
                    optionWrapper: {
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                      gap: 13,
                    },
                  }}
                  {...props}
                >
                  <Icon>{icon}</Icon>
                  <Text weight={300} style={{ color: theme[11], fontSize: 17 }}>
                    {text}
                  </Text>
                  {props.selected && (
                    <Icon style={{ marginLeft: "auto" }}>check</Icon>
                  )}
                </MenuOption>
              </Renderer>
            )
          )}
        </LinearGradient>
      </MenuOptions>
    </Menu>
  );
}
