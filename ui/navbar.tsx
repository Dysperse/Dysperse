import {
  AntDesign,
  Entypo,
  EvilIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Box, Button } from "@gluestack-ui/themed";
import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import React from "react";
import { Text, View } from "react-native";

interface NavbarProps extends NativeStackHeaderProps {
  icon: "arrow-back-ios" | "close" | "expand-more";
}

export default function Navbar(props: NavbarProps) {
  const handleBack = () => props.navigation.goBack();

  return (
    <Box
      paddingHorizontal="$4"
      gap="$2"
      style={{
        height: 64,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#fff",
      }}
    >
      <Button
        onPress={handleBack}
        sx={{
          height: 40,
          width: 40,
          px: 0,
        }}
      >
        <MaterialIcons
          name={props.icon}
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
