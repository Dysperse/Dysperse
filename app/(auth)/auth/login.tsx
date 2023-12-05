import { Button, Text, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../context/AuthProvider";
import { sendApiRequest } from "../../../helpers/api";
import Turnstile from "../../../ui/turnstile";

export default function Login() {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
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
        throw new Error("Invalid email or password");
      }
      await AsyncStorage.setItem("session", sessionRequest.key);

      const userRequest = await sendApiRequest("POST", "session", {
        token: sessionRequest.key,
      });

      setAlreadyLoggedIn(true);
      console.log(userRequest);
      setUser(userRequest);
      router.push("/");
    } catch (e) {
      setToken(null);
      setIsLoading(false);
      setStep(0);
      Toast.show({
        type: "error",
        text1: e.message,
      });
    }
  };

  useEffect(() => {
    if (typeof token === "string") login();
  }, [token]);

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
        padding: 30,
        margin: "auto",
        width: "100%",
      }}
    >
      <Text>{step === 0 ? " Welcome back!" : "Verifying..."}</Text>
      <Text>
        {step === 0
          ? "We're so excited to see you again! Please sign in with your Dysperse ID."
          : "Hang tight while we verify that you're a human."}
      </Text>
      {step === 0 ? (
        <>
          <TextInput value={email} onChangeText={(e) => setEmail(e)} />
          <TextInput
            value={password}
            secureTextEntry
            onChangeText={(e) => setPassword(e)}
          />
        </>
      ) : (
        <>
          <Turnstile setToken={setToken} />
        </>
      )}
      <Button title="Continue" disabled={isLoading || (step === 1 && !token)} />
    </ScrollView>
  );
}
