import { Entypo } from "@expo/vector-icons";
import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import React from "react";
import { Button, Text, View } from "tamagui";

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
      gap="$2"
      paddingHorizontal="$2"
      borderBottomWidth={2}
      borderBottomColor="$borderColorHover"
    >
      <Button
        onPress={handleBack}
        width="$4"
        padding={0}
        height="$4"
        paddingLeft={8}
        borderRadius={999}
        backgroundColor="transparent"
      >
        <Entypo
          name="chevron-thin-left"
          size={24}
          style={{
            width: "100%",
            textAlign: "center",
          }}
          color="black"
        />{" "}
      </Button>
      <Text style={{ fontWeight: "bold" }}>{props.options.headerTitle}</Text>
    </View>
  );
}
