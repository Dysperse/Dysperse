import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useAuth } from "../context/AuthProvider";
import Logo from "./logo";
import { View } from "react-native";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Box,
  Button,
  ButtonIcon,
  EditIcon,
  Text,
} from "@gluestack-ui/themed";

export default function AccountNavbar(props: any) {
  const { session } = useAuth();
  const handleBack = () => props.navigation.goBack();

  return (
    <Box
      paddingHorizontal="$2"
      borderBottomColor="$blueGray200"
      borderBottomWidth="$2"
      style={{
        height: 64,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#fff",
      }}
      gap="$2"
    >
      <Logo size={40} />
      <Box flexGrow={1} />
      <Button borderRadius="$full" width={40} height={40} bg="$blueGray200">
        <MaterialIcons name="workspaces-outline" size={22} color="black" />
      </Button>
      <Avatar
        bgColor="$blueGray200"
        size="md"
        borderRadius="$full"
        width={40}
        height={40}
      >
        <AvatarFallbackText>{session.user.name}</AvatarFallbackText>
        {session.user.Profile?.picture && (
          <AvatarImage
            source={{
              uri: session.user.Profile.picture,
            }}
            width={40}
            height={40}
          />
        )}
      </Avatar>

      {/* session.user.Profile.picture */}
    </Box>
  );
}
