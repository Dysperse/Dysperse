import { Button } from "@/ui/Button";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  TextInput,
  View,
} from "react-native";
import { useSession } from "../context/AuthProvider";
import { sendApiRequest } from "../helpers/api";
import Turnstile from "../ui/turnstile";

export default function SignIn() {
  const theme = useColorTheme();
  const { signIn, session } = useSession();
  const [step, setStep] = useState(0);

  const [token, setToken] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data) => {
      try {
        if (step === 0) {
          setStep(1);
        } else {
          setStep(2);
          console.log(data);
          const sessionRequest = await sendApiRequest(
            false,
            "POST",
            "auth/login",
            {},
            {
              body: JSON.stringify({ ...data, token }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!sessionRequest.session) throw new Error(sessionRequest);
          signIn(sessionRequest.session);
        }
      } catch (e) {
        alert("Something went wrong. Please try again later.");
        setToken("");
        setStep(0);
      }
    },
    [signIn, step, token]
  );

  useEffect(() => {
    if (step == 1 && token) {
      setStep(0);
      handleSubmit(onSubmit)();
    }
  }, [step, token, onSubmit, handleSubmit]);

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session]);

  return step == 0 || step == 2 ? (
    <KeyboardAvoidingView
      className="flex-1 items-center justify-center p-10 max-w-lg mx-auto w-full"
      behavior="height"
      style={{ gap: 15 }}
    >
      <Text
        textStyle={{ fontFamily: "heading" }}
        textClassName="uppercase text-center text-5xl"
      >
        Welcome to Dysperse.
      </Text>
      <Text>Please sign in with your Dysperse ID</Text>
      <View className="w-full">
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border-2 px-5 mt-2 py-3 w-full rounded-2xl border-gray-300"
              placeholder="Email"
              placeholderTextColor="#aaa"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={{
                ...(errors.email && { borderColor: "red" }),
              }}
            />
          )}
          name="email"
        />
        <Controller
          control={control}
          rules={{
            maxLength: 100,
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border-2 px-5 mt-4 py-3 w-full rounded-2xl border-gray-300"
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#aaa"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={{
                ...(errors.password && { borderColor: "red" }),
              }}
            />
          )}
          name="password"
        />
      </View>
      <Button
        variant="filled"
        buttonStyle={{
          width: "100%",
          justifyContent: "center",
        }}
        onPress={handleSubmit(onSubmit)}
        disabled={step === 2} // loading
      >
        {step === 2 ? (
          <ActivityIndicator />
        ) : (
          <Text textClassName="text-gray-50">Continue</Text>
        )}
      </Button>
    </KeyboardAvoidingView>
  ) : (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <Text
        style={{ fontFamily: "heading" }}
        textClassName="uppercase text-5xl mb-2"
      >
        Verifying...
      </Text>
      <Text textClassName="mb-3">Checking if you're actually human 🤨</Text>
      <Turnstile setToken={setToken} />
    </View>
  );
}
