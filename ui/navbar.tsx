import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import React from "react";
import { Button, Text, View } from "react-native";

interface NavbarProps extends NativeStackHeaderProps {
  icon?: "arrow-back-ios" | "close" | "expand-more";
}

export default function Navbar(props: NavbarProps) {
  const handleBack = () => props.navigation.goBack();

  return (
    <View
      style={{
        gap: 20,
        height: 64,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "red",
      }}
    >
      <Button title="Back" />
      <Text style={{ fontWeight: "bold" }}>
        {props.options.headerTitle as string}
      </Text>
    </View>
  );
}
