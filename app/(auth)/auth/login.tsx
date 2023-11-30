import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, H1, Input, ScrollView, Spinner, Text, View } from "tamagui";
import { useAuth } from "../../../context/AuthProvider";
import Turnstile from "../../../ui/turnstile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendApiRequest } from "../../../helpers/api";
import Toast from "react-native-toast-message";

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
      padding="$5"
      gap="$2"
    >
      <Button
        onPress={() => {
          Toast.show({
            type: "error",
            text1: "Incorrect email or password",
          });
        }}
      >
        HI
      </Button>
      <Button
        onPress={() => {
          Toast.show({
            type: "success",
            text1: "toast 2",
            text2: "toast 2 text",
          });
        }}
      >
        HI
      </Button>
      <H1
        textAlign="center"
        textTransform="uppercase"
        fontFamily={"heading" as any}
        fontWeight={500 as any}
      >
        {step === 0 ? " Welcome back!" : "Verifying..."}
      </H1>
      <Text marginBottom="$2" textAlign="center">
        {step === 0
          ? "We're so excited to see you again! Please sign in with your Dysperse ID."
          : "Hang tight while we verify that you're a human."}
      </Text>
      {step === 0 ? (
        <>
          <Input
            value={email}
            onChangeText={(e) => setEmail(e)}
            style={{ width: "100%" }}
            disabled={isLoading}
            size="$4"
            borderWidth={2}
            placeholder="Email or username"
          />
          <Input
            secureTextEntry
            value={password}
            onChangeText={(e) => setPassword(e)}
            style={{ width: "100%" }}
            disabled={isLoading}
            size="$4"
            borderWidth={2}
            placeholder="Password"
          />
        </>
      ) : (
        <>
          <Turnstile setToken={setToken} />
        </>
      )}
      <Button
        onPress={login}
        disabled={disabled}
        theme="active"
        width="100%"
        size="$4"
        opacity={disabled ? 0.6 : 1}
      >
        {isLoading || (step === 1 && !token) ? <Spinner /> : "Continue"}
      </Button>
      {step === 0 && (
        <View flexDirection="row">
          <Link asChild href="/auth/signup">
            <Button
              size="$2"
              marginLeft="auto"
              style={{ textDecoration: "none" }}
              opacity={0.7}
              chromeless
            >
              Forgot ID?
            </Button>
          </Link>
          <Link asChild href="/auth/signup">
            <Button
              size="$2"
              style={{ textDecoration: "none" }}
              opacity={0.7}
              chromeless
            >
              Create an account
            </Button>
          </Link>
        </View>
      )}
    </ScrollView>
  );
}
