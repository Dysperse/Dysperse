import {
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  ScrollView,
  View,
} from "@gluestack-ui/themed";
import React from "react";

export default function Home() {
  return (
    <ScrollView>
      <Box padding="$5">
        <Heading size="2xl">Heading</Heading>
        <Heading size="2xl">Text</Heading>
        <HStack gap="$2">
          <Button>
            <ButtonText>Default button</ButtonText>
          </Button>
          <Button variant="outlined">
            <ButtonText>Outlined button</ButtonText>
          </Button>
          <Button variant="filled">
            <ButtonText>Filled button</ButtonText>
          </Button>
        </HStack>
      </Box>
    </ScrollView>
  );
}
