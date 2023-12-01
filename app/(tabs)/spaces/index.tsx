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
  Text,
} from "@gluestack-ui/themed";
import { useState } from "react";
import useSWR from "swr";

export default function Page() {
  const { data, error } = useSWR("https://api.dysperse.com/user/spaces");
  const [view, setView] = useState("all");

  return data ? (
    <Box width={"100%"}>
      <FlatList
        padding="$5"
        ListHeaderComponent={
          <>
            <Heading
              size="5xl"
              textTransform="uppercase"
              fontFamily={"heading" as any}
              fontWeight={500 as any}
            >
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
          </>
        }
        data={data}
        height="100%"
        width="100%"
        renderItem={({ item }: any) => (
          <HStack
            paddingTop="$4"
            space="md"
            justifyContent="space-between"
            alignItems="center"
            marginTop="$2"
          >
            <Avatar size="md">
              <AvatarFallbackText>Space</AvatarFallbackText>
            </Avatar>
            <VStack width="100%">
              <Text fontWeight="$900">{item.profile.name}</Text>
              <Text color="$coolGray700">{item.profile.type}</Text>
            </VStack>
          </HStack>
        )}
      />
    </Box>
  ) : (
    <Spinner marginVertical="auto" />
  );
}
