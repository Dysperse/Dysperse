import { AvatarImage, VStack } from "@gluestack-ui/themed";
import { FlatList, HStack } from "@gluestack-ui/themed";
import { Avatar } from "@gluestack-ui/themed";
import { AvatarFallbackText } from "@gluestack-ui/themed";
import {
  Box,
  Button,
  ButtonGroup,
  ButtonText,
  Center,
  Heading,
  ScrollView,
  Spinner,
  View,
  Pressable,
  Text,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { useState } from "react";
import useSWR from "swr";

export default function Page() {
  const { data, error } = useSWR(["user/spaces", { test: "true" }]);
  const [view, setView] = useState("all");

  return data ? (
    <Box width={"100%"}>
      <FlatList
        py="$4"
        ListHeaderComponent={
          <Box px="$4">
            <Heading
              size="displayLarge"
              textTransform="uppercase"
              fontFamily={"heading" as any}
              fontWeight={500 as any}
              mb={4}
            >
              Spaces
            </Heading>
            <ButtonGroup isAttached mb={4}>
              <Button
                width="50%"
                borderWidth={2}
                borderRightWidth={0}
                variant={view !== "all" ? "outlined" : "filled"}
                onPress={() => setView("all")}
              >
                <ButtonText>All</ButtonText>
              </Button>
              <Button
                width="50%"
                borderWidth={2}
                borderLeftWidth={0}
                variant={view !== "invitations" ? "outlined" : "filled"}
                onPress={() => setView("invitations")}
              >
                <ButtonText>Invitations</ButtonText>
              </Button>
            </ButtonGroup>
          </Box>
        }
        data={data}
        height="100%"
        width="100%"
        renderItem={({ item }: any) => (
          <Pressable
            onPress={() => router.push("/spaces/" + item.id)}
            sx={{ ":active": { bg: "$primary4" } }}
            borderRadius={5}
            px="$5"
          >
            <HStack
              paddingVertical="$2"
              space="md"
              justifyContent="space-between"
              alignItems="center"
            >
              <Avatar size="md">
                <AvatarFallbackText>{item.profile.name[0]}</AvatarFallbackText>
              </Avatar>
              <VStack width="100%">
                <Text fontFamily="body_600">{item.profile.name}</Text>
                <Text>{item.profile.type}</Text>
              </VStack>
            </HStack>
          </Pressable>
        )}
      />
    </Box>
  ) : (
    <Spinner marginVertical="auto" />
  );
}
