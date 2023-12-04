import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthProvider";
import Turnstile from "../../../ui/turnstile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendApiRequest } from "../../../helpers/api";
import Toast from "react-native-toast-message";
import {
  Box,
  Button,
  ButtonSpinner,
  ButtonText,
  Heading,
  Input,
  InputField,
  Spinner,
  Text,
  View,
} from "@gluestack-ui/themed";
import { ScrollView } from "react-native";

export default function Login() {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState(0);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  return (
    <ScrollView
      style={{
        flex: 1,
        maxWidth: 500,
        margin: "auto",
      }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        gap: 10,
        margin: "auto",
      }}
    >
      <Heading
        size="headlineLarge"
        textAlign="center"
        textTransform="uppercase"
        fontFamily={"heading" as any}
        fontWeight={500 as any}
      >
        Welcome to Dysperse
      </Heading>
      <Text marginBottom="$2" textAlign="center">
        It's time to redefine the standard for productivity. Let's get started
      </Text>
      <Input variant="outline" size="md" isDisabled={isLoading}>
        <InputField
          placeholder="Email or username"
          onChangeText={(e) => setEmail(e)}
        />
      </Input>
      <Input variant="outline" size="md" isDisabled={isLoading}>
        <InputField
          secureTextEntry
          placeholder="Password"
          onChangeText={(e) => setPassword(e)}
        />
      </Input>
      <Button>
        <ButtonText>Continue</ButtonText>
      </Button>
      {step === 0 && (
        <Box flexDirection="row" gap="$4">
          <Link asChild href="/auth/login">
            <Button size="sm" marginLeft="auto">
              I have an account
            </Button>
          </Link>
        </Box>
      )}
    </ScrollView>
  );
}
