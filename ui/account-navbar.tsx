import { MaterialIcons } from "@expo/vector-icons";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Box,
  Button,
} from "@gluestack-ui/themed";
import { Link } from "expo-router";
import React from "react";
import { useAuth } from "../context/AuthProvider";
import Logo from "./logo";

function Spaces() {
  return (
    <Link asChild href="/spaces">
      <Button
        borderRadius="$full"
        bg="$blueGray200"
        size="xs"
        sx={{
          px: 0,
          w: 40,
          h: 40,
        }}
      >
        <MaterialIcons name="workspaces-outline" size={22} color="black" />
      </Button>
    </Link>
  );
}

export default function AccountNavbar(props: any) {
  const { session } = useAuth();
  const handleBack = () => props.navigation.goBack();

  return (
    <Box
      paddingHorizontal="$4"
      borderBottomColor="$primary6"
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
      <Spaces />
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
            alt="Profile Picture"
            width={40}
            height={40}
          />
        )}
      </Avatar>
    </Box>
  );
}
