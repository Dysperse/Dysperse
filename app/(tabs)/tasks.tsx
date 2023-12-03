import {
  BadgeIcon,
  ModalBackdrop,
  ModalCloseButton,
  Text,
} from "@gluestack-ui/themed";
import { Center } from "@gluestack-ui/themed";
import { ModalContent } from "@gluestack-ui/themed";
import { CloseIcon } from "@gluestack-ui/themed";
import { ModalBody } from "@gluestack-ui/themed";
import { ModalFooter } from "@gluestack-ui/themed";
import { Icon } from "@gluestack-ui/themed";
import { ModalHeader } from "@gluestack-ui/themed";
import { Modal } from "@gluestack-ui/themed";
import { GlobeIcon } from "@gluestack-ui/themed";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Badge,
  ScrollView,
  View,
  BadgeText,
} from "@gluestack-ui/themed";
import { BlurView } from "expo-blur";
import React, { useState } from "react";

function ModalTest() {
  const [showModal, setShowModal] = useState(false);
  console.log(showModal);
  const ref = React.useRef(null);
  return (
    <Center h={300}>
      <Button onPress={() => setShowModal(true)} ref={ref}>
        <ButtonText>Show Modal</ButtonText>
      </Button>
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        finalFocusRef={ref}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Engage with Modals</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>
              Elevate user interactions with our versatile modals. Seamlessly
              integrate notifications, forms, and media displays. Make an impact
              effortlessly.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outlined"
              size="sm"
              mr="$3"
              onPress={() => {
                setShowModal(false);
              }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              borderWidth="$0"
              onPress={() => {
                setShowModal(false);
              }}
            >
              <ButtonText>Explore</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Center>
  );
}

export default function Home() {
  return (
    <ScrollView>
      <Box padding="$5">
        <Heading title textShadowColor="black">
          Title
        </Heading>
        <Heading size="xl">Heading xl</Heading>
        <Heading size="lg">Heading lg</Heading>
        <Heading size="md">Heading md</Heading>
        <Heading size="sm">Heading sm</Heading>
        <Heading eyebrow>Eyebrow</Heading>
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
        <Box>
          <Badge size="md" variant="solid" action="success" marginRight="auto">
            <BadgeIcon as={GlobeIcon} ml="$2" />
            <BadgeText>New feature</BadgeText>
          </Badge>
        </Box>
        <ModalTest />
      </Box>
    </ScrollView>
  );
}
