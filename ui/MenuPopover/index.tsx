import { LinearGradient } from "expo-linear-gradient";
import React, { ReactElement, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
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
import Divider from "../Divider";
import Icon from "../Icon";
import Text from "../Text";
import { useColorTheme } from "../color/theme-provider";

export type MenuOption =
  | { divider: boolean; key: string }
  | (MenuOptionProps & {
      icon: string;
      text: string;
      callback?;
      selected?: boolean;
      renderer?: (children) => ReactElement;
    })
  | { renderer: (children) => ReactElement; itemKey?: string };
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
  const menuRef = useRef<Menu>(null);
  const theme = useColorTheme();

  useHotkeys("esc", () => {
    if (menuRef?.current?.isOpen()) menuRef.current.close();
  });

  return (
    <Menu
      {...menuProps}
      ref={menuRef}
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
            shadowColor: theme[1],
            shadowRadius: 20,
            shadowOpacity: 0.8,
            shadowOffset: {
              width: 10,
              height: 10,
            },
            ...(containerStyle as any),
          },
        }}
      >
        <LinearGradient colors={[theme[3], theme[4]]} style={{ padding: 3 }}>
          {options.map(
            ({
              icon,
              text,
              key,
              callback,
              renderer: Renderer = React.Fragment,
              ...props
            }: any) => (
              // TODO: Fix key
              <React.Fragment key={Math.random()}>
                {props.divider ? (
                  <Divider style={{ width: "90%", marginVertical: 5 }} />
                ) : (
                  <Renderer>
                    <MenuOption
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
                      <Text
                        weight={300}
                        style={{ color: theme[11], fontSize: 17 }}
                      >
                        {text}
                      </Text>
                      {props.selected && (
                        <Icon style={{ marginLeft: "auto" }}>check</Icon>
                      )}
                    </MenuOption>
                  </Renderer>
                )}
              </React.Fragment>
            )
          )}
        </LinearGradient>
      </MenuOptions>
    </Menu>
  );
}
