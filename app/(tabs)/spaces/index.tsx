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
} from "@gluestack-ui/themed";
import { useState } from "react";
import { Text } from "react-native";
import useSWR from "swr";

export default function Page() {
  const { data, error } = useSWR("https://api.dysperse.com/user/spaces");
  const [view, setView] = useState("all");

  return (
    <ScrollView contentContainerStyle={{ height: "100%" }}>
      {data ? (
        <Center>
          <Box maxWidth={500} width={"100%"}>
            <Heading size="5xl" fontFamily="heading" textTransform="uppercase">
              Spaces
            </Heading>
            <ButtonGroup isAttached>
              <Button
                width="50%"
                borderWidth={2}
                variant={view !== "all" ? "outline" : null}
                onPress={() => setView("all")}
              >
                <ButtonText>All</ButtonText>
              </Button>
              <Button
                width="50%"
                borderWidth={2}
                borderLeftWidth={0}
                variant={view !== "invitations" ? "outline" : null}
                onPress={() => setView("invitations")}
              >
                <ButtonText>Invitations</ButtonText>
              </Button>
            </ButtonGroup>
            <FlatList
              data={data}
              renderItem={({ item }) => (
                <HStack
                  space="md"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop="$2"
                >
                  <Avatar size="md">
                    <AvatarFallbackText>Space</AvatarFallbackText>
                  </Avatar>
                  <VStack width="100%">
                    <Text color="$coolGray800" fontWeight="$bold">
                      {item.profile.name}
                    </Text>
                    <Text color="$coolGray600">{item.profile.type}</Text>
                  </VStack>
                </HStack>
              )}
            />
          </Box>
        </Center>
      ) : (
        <Spinner marginVertical="auto" />
      )}
    </ScrollView>
  );
}
