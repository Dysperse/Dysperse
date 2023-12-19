import { useOpenTab } from "@/context/tabs";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { addHslAlpha, useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";

export function Tab({
  tab,
  disabled = false,
  isList = false,
  handleClose = () => {},
  onLongPress = () => {},
}) {
  const isPerspective = useMemo(
    () => tab.tabData.href.includes("perspectives"),
    [tab.tabData]
  );

  const { activeTab, setActiveTab } = useOpenTab();
  const theme = useColorTheme();
  const redPalette = useColor("red", true);
  const colors = isPerspective ? redPalette : redPalette;
  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        padding: isList ? 0 : 6,
        paddingBottom: 0,
        paddingHorizontal: isList ? 0 : 3,
        flex: 1,
        width: "100%",
        height: width > 600 ? 53.5 : 50,
        marginHorizontal: "auto",
        ...(Platform.OS === "web" &&
          ({
            width: "200px",
            flexDirection: "row",
            alignItems: "center",
          } as Object)),
      }}
    >
      <Pressable
        onLongPress={onLongPress}
        disabled={disabled}
        onPress={() => {
          setActiveTab(tab.id);
          router.replace(tab.tabData.href);
          handleClose();
        }}
        style={({ pressed, hovered }: any) => ({
          flex: 1,
          paddingHorizontal: isList ? 6 : 15,
          columnGap: 15,
          borderRadius: 20,
          height: "100%",
          alignItems: "center",
          flexDirection: "row",
          ...(width > 600
            ? {
                backgroundColor:
                  activeTab === tab.id
                    ? theme[pressed ? 6 : hovered ? 5 : 4]
                    : pressed
                    ? theme[5]
                    : hovered
                    ? theme[4]
                    : addHslAlpha(theme[3], 0.7),
              }
            : {
                backgroundColor: isList
                  ? "transparent"
                  : theme[
                      activeTab === tab.id ? 5 : pressed ? 4 : hovered ? 3 : 3
                    ],
              }),
        })}
      >
        <LinearGradient
          colors={[colors[6], colors[7]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 10,
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={24} style={{ color: colors[12] }}>
            {tab.tabData.icon}
          </Icon>
        </LinearGradient>
        <Text
          style={{
            ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
          }}
        >
          {tab.tabData.label}
        </Text>
      </Pressable>
    </View>
  );
}
