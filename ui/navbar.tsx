import React from "react";
import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { Button, View } from "tamagui";
import { Text } from "tamagui";
import { AntDesign } from "@expo/vector-icons";

export default function Navbar(props: NativeStackHeaderProps) {
  const handleBack = () => props.navigation.goBack();

  return (
    <View
      style={{
        height: 64,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#fff",
      }}
      paddingHorizontal="$2"
      borderBottomWidth={2}
      borderBottomColor="$borderColorHover"
    >
      <Button
        onPress={handleBack}
        width="$4"
        padding={0}
        height="$4"
        backgroundColor="transparent"
      ></Button>
      <Text style={{ fontWeight: "bold" }}>{props.options.headerTitle}</Text>
      <AntDesign name="stepforward" size={24} color="black" />
    </View>
  );
}
