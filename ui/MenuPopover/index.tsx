import { useHotkeys } from "@/helpers/useHotKeys";
import { BlurView } from "expo-blur";
import React, { ReactElement, cloneElement, memo, useRef } from "react";
import {
  Platform,
  Pressable,
  PressableProps,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  Menu,
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
import { addHslAlpha, useDarkMode } from "../color";
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
      closeOnSelect?: boolean;
      scrollViewStyle?: StyleProp<ViewStyle>;
      scrollViewProps?: ScrollViewProps;
    }
  | {
      trigger: ReactElement;
      options?: never;
      menuProps?: MenuPropsType;
      containerStyle?: StyleProp<ViewStyle>;
      children: any;
      menuRef?: React.MutableRefObject<Menu>;
      closeOnSelect?: boolean;
      scrollViewStyle?: StyleProp<ViewStyle>;
      scrollViewProps?: ScrollViewProps;
    };

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5, borderRadius: 20, overflow: "hidden" },
});

const isFirefox =
  Platform.OS === "web" && navigator.userAgent.includes("Firefox");

export function MenuItem(
  props: PressableProps & {
    removeExtraStyles?: boolean;
    text?: string;
    icon?: string;
    selected?: boolean;
    callback?: () => void;
  }
) {
  const theme = useColorTheme();
  return (
    <Pressable
      {...props}
      style={({ pressed, hovered }) => [
        {
          backgroundColor: pressed
            ? addHslAlpha(theme[8], 0.4)
            : hovered
            ? addHslAlpha(theme[7], 0.4)
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
        props.disabled && { opacity: 0.5 },
        props.style as StyleProp<ViewStyle>,
      ]}
    >
      {props.children || (
        <>
          {props.icon && <Icon>{props.icon}</Icon>}
          <Text weight={300} style={{ color: theme[11], fontSize: 16 }}>
            {props.text}
          </Text>
          {props.selected && <Icon style={{ marginLeft: "auto" }}>check</Icon>}
        </>
      )}
    </Pressable>
  );
}

function MenuPopover({
  trigger,
  options,
  menuProps,
  children,
  containerStyle,
  menuRef,
  closeOnSelect = true,
  scrollViewStyle,
  scrollViewProps,
}: MenuProps) {
  const _menuRef = useRef<Menu>(null);
  const isDark = useDarkMode();
  const menuPopupRef = menuRef || _menuRef;
  const theme = useColorTheme();

  useHotkeys("esc", () => {
    if (menuPopupRef?.current?.isOpen()) menuPopupRef.current.close();
  });

  const handleOpen = () => menuPopupRef.current.open();
  const t = cloneElement(trigger, {
    onPress: () => {
      handleOpen();
      trigger.props?.onPress?.();
    },
  });
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
            borderRadius: 25,
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
              backgroundColor: addHslAlpha(
                theme[Platform.OS === "android" || isFirefox ? 4 : 6],
                Platform.OS === "android" || isFirefox ? 1 : 0.4
              ),
              borderRadius: 25,
              overflow: "hidden",
            }}
          >
            <BlurView
              tint={isDark ? "dark" : "light"}
              style={[styles.container]}
              intensity={Platform.OS === "android" || isFirefox ? 0 : undefined}
            >
              <ScrollView
                bounces={false}
                {...scrollViewProps}
                style={scrollViewStyle}
                showsVerticalScrollIndicator={false}
              >
                {children ||
                  options
                    .filter((e) => e)
                    .map(
                      ({
                        icon,
                        text,
                        callback,
                        renderer: Renderer = React.Fragment,
                        ...props
                      }: any) => (
                        // TODO: Fix key
                        <React.Fragment key={Math.random()}>
                          {props.divider ? (
                            <Divider
                              style={{
                                width: "90%",
                                marginVertical: 5,
                                backgroundColor: addHslAlpha(theme[9], 0.2),
                              }}
                            />
                          ) : (
                            <Renderer>
                              <MenuItem
                                onPress={() => {
                                  callback();
                                  if (closeOnSelect)
                                    menuPopupRef.current.close();
                                }}
                                {...props}
                              >
                                {icon && typeof icon === "string" ? (
                                  <Icon>{icon}</Icon>
                                ) : (
                                  icon
                                )}
                                <Text
                                  weight={300}
                                  style={{ color: theme[11], fontSize: 16 }}
                                >
                                  {text}
                                </Text>
                                {props.selected && (
                                  <Icon style={{ marginLeft: "auto" }}>
                                    check
                                  </Icon>
                                )}
                              </MenuItem>
                            </Renderer>
                          )}
                        </React.Fragment>
                      )
                    )}
              </ScrollView>
            </BlurView>
          </View>
        </Animated.View>
      </MenuOptions>
    </Menu>
  );
}
export default memo(MenuPopover);

