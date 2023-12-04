import {
  Badge,
  BadgeIcon,
  BadgeText,
  Box,
  Button,
  ButtonText,
  Divider,
  GlobeIcon,
  HStack,
  Heading,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollView,
  Text,
} from "@gluestack-ui/themed";
import React, { useState } from "react";

function ModalTest() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Box>
      <Button
        onPress={() => setShowModal(true)}
        variant="tonal"
        marginRight="auto"
      >
        <ButtonText>Show Modal</ButtonText>
      </Button>
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading>Delete task?</Heading>
          </ModalHeader>
          <ModalBody>
            <Text>You can't undo this action</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              onPress={() => {
                setShowModal(false);
              }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button variant="outlined" onPress={() => setShowModal(false)}>
              <ButtonText>Continue</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default function Home() {
  return (
    <ScrollView>
      <Box padding="$12">
        <Heading eyebrow>Eyebrow</Heading>
        <Heading size="displayLarge">Display large</Heading>
        <Heading size="displayMedium">Display medium</Heading>
        <Heading size="displaySmall">Display small</Heading>
        <Heading size="headlineLarge">Headline large</Heading>
        <Heading size="headlineMedium">Headline medium</Heading>
        <Heading size="headlineSmall">Headline small</Heading>
        <Heading size="titleLarge">Title large</Heading>
        <Heading size="titleMedium">Title medium</Heading>
        <Heading size="titleSmall">Title small</Heading>
        <Heading size="bodyLarge">Body large</Heading>
        <Heading size="bodyMedium">Body medium</Heading>
        <Heading size="bodySmall">Body small</Heading>
        <Heading size="labelLarge">Label large</Heading>
        <Heading size="labelMedium">Label medium</Heading>
        <Heading size="labelSmall">Label small</Heading>
        <Divider my="$4" />
        <HStack gap="$2">
          <Button variant="filled">
            <ButtonText>Filled button</ButtonText>
          </Button>
          <Button variant="tonal">
            <ButtonText>Tonal button</ButtonText>
          </Button>
          <Button variant="outlined">
            <ButtonText>Outlined button</ButtonText>
          </Button>
          <Button>
            <ButtonText>Text button (default)</ButtonText>
          </Button>
        </HStack>
        <Divider my="$4" />
        <HStack gap="$2">
          <Badge size="md" variant="solid" action="success">
            <BadgeText>Badge</BadgeText>
          </Badge>
          <Badge size="md" variant="solid" action="success" marginRight="auto">
            <BadgeIcon as={GlobeIcon} ml="$2" />
            <BadgeText>Badge with icon</BadgeText>
          </Badge>
        </HStack>
        <Divider my="$4" />
        <ModalTest />
      </Box>
    </ScrollView>
  );
}
