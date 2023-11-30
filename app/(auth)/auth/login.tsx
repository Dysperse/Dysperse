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

  const disabled = isLoading || !email.trim() || !password.trim();

  const login = async () => {
    try {
      setIsLoading(true);
      if (step === 0) {
        setAlreadyLoggedIn(false);
        setStep(1);
        return;
      }

      const sessionRequest = await sendApiRequest(
        "POST",
        "auth/login",
        {},
        {
          body: JSON.stringify({
            email,
            password,
            token,
          }),
        }
      );

      if (!sessionRequest.key) {
        Toast.show({
          type: "error",
          text1: "Incorrect email or password",
        });
        setIsLoading(false);
        setStep(0);
        return;
      }
      await AsyncStorage.setItem("session", sessionRequest.key);

      const userRequest = await sendApiRequest("POST", "session", {
        token: sessionRequest.key,
      });

      setAlreadyLoggedIn(true);
      setUser(userRequest);
      router.push("/");
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: "Please try again later",
      });
    }
  };

  useEffect(() => {
    if (token && !alreadyLoggedIn) {
      login();
    }
  }, [token, alreadyLoggedIn]);

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
        size="2xl"
        textAlign="center"
        textTransform="uppercase"
        fontFamily={"heading" as any}
        fontWeight={500 as any}
      >
        {step === 0 ? " Welcome back!" : "Verifying..."}
      </Heading>
      <Text marginBottom="$2" textAlign="center">
        {step === 0
          ? "We're so excited to see you again! Please sign in with your Dysperse ID."
          : "Hang tight while we verify that you're a human."}
      </Text>
      {step === 0 ? (
        <>
          <Input variant="outline" size="md" isDisabled={isLoading}>
            <InputField
              placeholder="Email or username"
              value={email}
              onChangeText={(e) => setEmail(e)}
            />
          </Input>
          <Input variant="outline" size="md" isDisabled={isLoading}>
            <InputField
              secureTextEntry
              placeholder="Password"
              value={password}
              onChangeText={(e) => setPassword(e)}
            />
          </Input>
        </>
      ) : (
        <>
          <Turnstile setToken={setToken} />
        </>
      )}
      <Button onPress={login} isDisabled={disabled}>
        {isLoading || (step === 1 && !token) ? (
          <ButtonSpinner mr="$2" />
        ) : (
          <ButtonText fontWeight="$medium" fontSize="$sm">
            Continue
          </ButtonText>
        )}
      </Button>
      {step === 0 && (
        <Box flexDirection="row" gap="$4">
          <Link asChild href="/auth/signup">
            <Button size="sm" marginLeft="auto" variant="link">
              <ButtonText>Forgot ID?</ButtonText>
            </Button>
          </Link>
          <Link asChild href="/auth/signup">
            <Button size="sm" variant="link">
              <ButtonText>Create an account</ButtonText>
            </Button>
          </Link>
        </Box>
      )}
    </ScrollView>
  );
}
