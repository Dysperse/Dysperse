import { useOpenTab } from "@/context/tabs";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, View } from "react-native";

export function Tab({ tab, isList = false, handleClose = () => {} }) {
  const isPerspective = useMemo(
    () => tab.tabData.href.includes("perspectives"),
    [tab.tabData]
  );

  const { activeTab, setActiveTab } = useOpenTab();
  const redPalette = useColor("red", false);
  const colors = isPerspective ? redPalette : redPalette;

  return (
    <View
      style={{
        padding: isList ? 0 : 8,
        paddingHorizontal: isList ? 0 : 4,
        flex: 1,
        width: "100%",
        height: 64,
        marginHorizontal: "auto",
        ...(Platform.OS === "web" &&
          ({
            width: "200px",
          } as Object)),
      }}
    >
      <Pressable
        onPress={() => {
          setActiveTab(tab.id);
          router.replace(tab.tabData.href);
          handleClose();
        }}
        style={{
          flex: 1,
          paddingHorizontal: isList ? 6 : 15,
          columnGap: 15,
          borderRadius: 20,
          height: "100%",
          alignItems: "center",
          flexDirection: "row",
          backgroundColor: isList ? "transparent" : "#ddd",
        }}
        className="active:opacity-60"
      >
        <LinearGradient
          colors={[colors[5], colors[7]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 14,
            width: 35,
            height: 35,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={30} style={{ color: colors[11] }}>
            {tab.tabData.icon}
          </Icon>
        </LinearGradient>
        <Text>{tab.tabData.label}</Text>
      </Pressable>
    </View>
  );
}
