import { LinearGradient } from "expo-linear-gradient";
import { ReactElement } from "react";
import { Pressable } from "react-native";
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
  callback;
  selected?: boolean;
};
interface MenuProps {
  trigger: ReactElement;
  options: MenuOption[];
  menuProps?: MenuPropsType;
}

export default function MenuPopover({
  trigger,
  options,
  menuProps,
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
          },
        }}
      >
        <LinearGradient colors={[theme[3], theme[4]]} style={{ padding: 3 }}>
          {options.map(({ icon, text, callback, ...props }) => (
            <MenuOption
              key={text}
              onSelect={callback}
              customStyles={{
                OptionTouchableComponent: (props) => (
                  <Pressable
                    {...props}
                    style={({ pressed, hovered }: any) => [
                      {
                        backgroundColor: pressed
                          ? theme[5]
                          : hovered
                          ? theme[6]
                          : undefined,
                        borderRadius: 20,
                        zIndex: 2,
                      },
                      props.style,
                    ]}
                  />
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
          ))}
        </LinearGradient>
      </MenuOptions>
    </Menu>
  );
}
