import { useHotkeys } from "@/helpers/useHotKeys";
import React, { ReactElement, cloneElement, useRef } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptionProps,
  MenuOptions,
  MenuProps as MenuPropsType,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Divider from "../Divider";
import Icon from "../Icon";
import Text from "../Text";
import { useColorTheme } from "../color/theme-provider";

export type MenuOption =
  | { divider: boolean; key: string }
  | (MenuOptionProps & {
      icon?: string;
      text: string;
      callback?;
      selected?: boolean;
      renderer?: (children) => ReactElement;
    })
  | { renderer: (children) => ReactElement; itemKey?: string };

export type MenuProps =
  | {
      trigger: ReactElement;
      options?: MenuOption[];
      menuProps?: MenuPropsType;
      containerStyle?: StyleProp<ViewStyle>;
      children?: never;
      menuRef?: React.MutableRefObject<Menu>;
    }
  | {
      trigger: ReactElement;
      options?: never;
      menuProps?: MenuPropsType;
      containerStyle?: StyleProp<ViewStyle>;
      children: any;
      menuRef?: React.MutableRefObject<Menu>;
    };

export function MenuItem(
  props: PressableProps & { removeExtraStyles?: boolean }
) {
  const theme = useColorTheme();
  return (
    <Pressable
      {...props}
      style={({ pressed, hovered }) =>
        [
          {
            backgroundColor: pressed
              ? theme[6]
              : hovered
              ? theme[5]
              : undefined,
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
        ] as any
      }
    />
  );
}

export default function MenuPopover({
  trigger,
  options,
  menuProps,
  children,
  containerStyle,
  menuRef,
}: MenuProps) {
  const _menuRef = useRef<Menu>(null);
  const menuPopupRef = menuRef || _menuRef;
  const theme = useColorTheme();

  useHotkeys("esc", () => {
    if (menuPopupRef?.current?.isOpen()) menuPopupRef.current.close();
  });

  const handleOpen = async () => {
    menuPopupRef.current.open();
  };

  const t = cloneElement(trigger, { onPress: handleOpen });

  const s = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          s.value === 0
            ? menuProps?.rendererProps?.placement === "top"
              ? 150
              : -150
            : withSpring(0, {
                damping: 250,
                stiffness: 900,
              }),
      },
    ],
  }));

  return (
    <Menu
      {...menuProps}
      ref={menuPopupRef}
      rendererProps={{
        openAnimationDuration: 0,
        closeAnimationDuration: 0,
        preferredPlacement: "bottom",
        // placement: "bottom",
        anchorStyle: {
          opacity: 0,
        },
        ...menuProps?.rendererProps,
      }}
      onOpen={() => {
        menuProps?.onOpen?.();
        setTimeout(() => {
          s.value = 1;
        });
      }}
      onClose={() => {
        menuProps?.onClose?.();
        s.value = 0;
      }}
      renderer={renderers.Popover}
    >
      <MenuTrigger disabled customStyles={{ TriggerTouchableComponent: View }}>
        {t}
      </MenuTrigger>

      <MenuOptions
        customStyles={{
          optionsContainer: {
            width: 180,
            borderRadius: 20,
            overflow: "hidden",
            shadowRadius: 0,
            shadowColor: "transparent",
            backgroundColor: "transparent",
            ...(containerStyle as any),
          },
        }}
      >
        <Animated.View style={animatedStyle}>
          <View
            style={{
              flex: 1,
              backgroundColor: theme[4],
              padding: 5,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {children ||
              options
                .filter((e) => e)
                .map(
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
                                ...(props.disabled && {
                                  opacity: 0.7,
                                }),
                              },
                            }}
                            {...props}
                          >
                            {icon && <Icon>{icon}</Icon>}
                            <Text
                              weight={300}
                              style={{ color: theme[11], fontSize: 16 }}
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
          </View>
        </Animated.View>
      </MenuOptions>
    </Menu>
  );
}
