import { Button, ButtonText } from "@/ui/Button";
import Text from "@/ui/Text";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  TextInput,
  View,
} from "react-native";
import { useSession } from "../context/AuthProvider";
import { sendApiRequest } from "../helpers/api";
import Turnstile from "../ui/turnstile";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Platform } from "react-native";
import { BlurView } from "expo-blur";
import { addHslAlpha } from "@/ui/color";

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

  const theme = useColorTheme();

  return (
    <ImageBackground
      source={{
        uri: "https://my.dysperse.com/auth/background-light.png?purge=dev",
      }}
      style={{ height: "100%" }}
      resizeMode="cover"
    >
      {step == 0 || step == 2 ? (
        <KeyboardAvoidingView
          behavior="height"
          style={{
            gap: 15,
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <BlurView
            intensity={20}
            style={{
              borderWidth: 2,
              borderColor: theme[7],
              padding: 30,
              borderRadius: 28,
              overflow: "hidden",
            }}
          >
            <Text heading style={{ fontSize: 30, textAlign: "center" }}>
              Welcome to Dysperse.
            </Text>
            <Text style={{ paddingTop: 10, paddingBottom: 20, opacity: 0.6 }}>
              Please sign in with your Dysperse ID
            </Text>
            <View style={{ gap: 10 }}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    style={{
                      borderWidth: 2,
                      paddingHorizontal: 20,
                      paddingVertical: 15,
                      borderRadius: 15,
                      backgroundColor: addHslAlpha(theme[5], 0.5),
                      borderColor: errors.email
                        ? "red"
                        : addHslAlpha(theme[9], 0.5),
                      ...(Platform.OS === "web" && { outline: "none" }),
                    }}
                    placeholder="Email or username"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
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
                    style={{
                      borderWidth: 2,
                      paddingHorizontal: 20,
                      paddingVertical: 15,
                      borderRadius: 15,
                      backgroundColor: addHslAlpha(theme[5], 0.5),
                      borderColor: errors.password
                        ? "red"
                        : addHslAlpha(theme[9], 0.5),
                      ...(Platform.OS === "web" && { outline: "none" }),
                    }}
                    placeholder="Password"
                    secureTextEntry
                    placeholderTextColor="#aaa"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="password"
              />
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <Button style={{ height: 20 }}>
                  <ButtonText>Need help signing in?</ButtonText>
                </Button>
              </View>
              <Button
                variant="filled"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  backgroundColor: theme[7],
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
              <Button style={{ height: 20 }}>
                <ButtonText>Create an account</ButtonText>
              </Button>
            </View>
          </BlurView>
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
      )}
    </ImageBackground>
  );
}
