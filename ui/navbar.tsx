import React from "react";
import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { Button, View } from "tamagui";
import { Text } from "tamagui";

export default function Navbar(props: NativeStackHeaderProps) {
  const handleBack = () => props.navigation.goBack();

  return (
    <View
      style={{ height: 64, alignItems: "center", flexDirection: "row" }}
      paddingHorizontal="$2"
      borderBottomWidth={2}
      borderBottomColor="$borderColorHover"
    >
      <Button onPress={handleBack} width="$4" padding={0} height="$4">
        &lt;
      </Button>
      <Text>{props.options.headerTitle}</Text>
    </View>
  );
}
