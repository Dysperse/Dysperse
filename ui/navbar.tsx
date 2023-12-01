import { AntDesign, Entypo, EvilIcons } from "@expo/vector-icons";
import { Box, Button } from "@gluestack-ui/themed";
import { NativeStackHeaderProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import React from "react";
import { Text, View } from "react-native";

export default function Navbar(props: NativeStackHeaderProps) {
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
        variant="link"
        onPress={handleBack}
        sx={{
          width: 40,
          height: 40,
          padding: 0,
          ":hover": { backgroundColor: "$blueGray200" },
          borderRadius: 999,
        }}
      >
        <AntDesign
          name="close"
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
