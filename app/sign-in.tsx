import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import { useSession } from "../context/AuthProvider";
import { sendApiRequest } from "../helpers/api";
import Turnstile from "../ui/turnstile";

export default function SignIn() {
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

  const onSubmit = async (data) => {
    try {
      if (step === 0) {
        setStep(1);
      } else {
        setStep(2);
        const sessionRequest = await sendApiRequest(
          false,
          "POST",
          "auth/login",
          {},
          {
            body: JSON.stringify({ ...data, token }),
          }
        );
        if (!sessionRequest.key) throw new Error(sessionRequest);
        signIn(sessionRequest.key);
      }
    } catch (e) {
      alert("Something went wrong. Please try again later");
      setToken("");
      setStep(0);
    }
  };

  useEffect(() => {
    if (step == 1 && token) {
      setStep(0);
      handleSubmit(onSubmit)();
    }
  }, [step, token, handleSubmit]);

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session]);

  return step == 0 || step == 2 ? (
    <KeyboardAvoidingView
      className="gap-3 flex-1 items-center justify-center p-10 max-w-lg mx-auto w-full"
      behavior="padding"
    >
      <Text style={{ fontFamily: "heading" }} className="uppercase text-5xl">
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
              className="border-2 px-5 mt-3 py-3 w-full rounded-2xl border-gray-300"
              placeholder="Email"
              placeholderTextColor="black"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="email"
        />
        {errors.email && <Text>This is required.</Text>}
        <Controller
          control={control}
          rules={{
            maxLength: 100,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border-2 px-5 mt-3 py-3 w-full rounded-2xl border-gray-300"
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="black"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="password"
        />
      </View>
      <Pressable
        className={`bg-gray-700 w-full rounded-2xl justify-center items-center active:bg-gray-900 h-12 ${
          step === 2 ? "bg-gray-300" : ""
        }`}
        onPress={handleSubmit(onSubmit)}
        disabled={step === 2} // loading
      >
        {step === 2 ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-gray-50">Continue</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  ) : (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <Text style={{ fontFamily: "heading" }} className="uppercase text-5xl mb-2">
        Verifying...
      </Text>
      <Text className="mb-3">Checking if you're actually human 🤨</Text>
      <Turnstile setToken={setToken} />
    </View>
  );
}
