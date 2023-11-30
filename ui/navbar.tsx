import { Entypo } from "@expo/vector-icons";
import { Box, Button } from "@gluestack-ui/themed";
import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import React from "react";
import { Text, View } from "react-native";

export default function Navbar(props: NativeStackHeaderProps) {
  const handleBack = () => props.navigation.goBack();

  return (
    <Box
      paddingHorizontal="$2"
      style={{
        height: 64,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#fff",
      }}
    >
      <Button
        onPress={handleBack}
        width="$4"
        height="$4"
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
        />
      </Button>
      <Text style={{ fontWeight: "bold" }}>
        {props.options.headerTitle as string}
      </Text>
    </Box>
  );
}
