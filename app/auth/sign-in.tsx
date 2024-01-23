import { Button, ButtonText } from "@/ui/Button";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../context/AuthProvider";
import { sendApiRequest } from "../../helpers/api";
import Turnstile from "../../ui/turnstile";
import { authStyles } from "./authStyles";

const styles = StyleSheet.create({
  title: { fontSize: 55, width: "100%", lineHeight: 55 },
});

export default function SignIn() {
  const { signIn, session } = useSession();
  const [step, setStep] = useState(0);
  const insets = useSafeAreaInsets();

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

  const handleBack = useCallback(() => router.back(), []);
  const theme = useColorTheme();

  return (
    <View style={{ backgroundColor: theme[1], flex: 1 }}>
      <IconButton
        variant="outlined"
        size={55}
        icon="close"
        onPress={handleBack}
        style={{ margin: 20 }}
      />
      {step == 0 || step == 2 ? (
        <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
          <ScrollView
            style={{ maxHeight: "100%" }}
            contentContainerStyle={[
              authStyles.container,
              {
                justifyContent: "flex-start",
                flex: undefined,
                paddingBottom: insets.top + 40,
                paddingTop: 40,
              },
            ]}
          >
            <Text heading style={[styles.title, { color: theme[11] }]}>
              Sign in
            </Text>
            <Text style={authStyles.subtitleContainer}>
              Use your Dysperse ID to continue
            </Text>
            <View style={{ gap: 10 }}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    variant="filled+outlined"
                    style={{
                      paddingHorizontal: 30,
                      paddingVertical: 20,
                      fontSize: 20,
                      borderColor: errors.email ? "red" : theme[6],
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
                  <TextField
                    variant="filled+outlined"
                    style={{
                      paddingHorizontal: 30,
                      paddingVertical: 20,
                      fontSize: 20,
                      borderColor: errors.password ? "red" : theme[6],
                      ...(Platform.OS === "web" && { outline: "none" }),
                    }}
                    onSubmitEditing={handleSubmit(onSubmit)}
                    placeholder="Password"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="password"
              />
              <Button
                variant="filled"
                style={[authStyles.button, { marginTop: 20 }]}
                onPress={handleSubmit(onSubmit)}
                isLoading={step === 2}
              >
                <ButtonText style={authStyles.buttonText}>Continue</ButtonText>
              </Button>
              <Button dense variant="outlined" style={[authStyles.button]}>
                <ButtonText
                  style={[authStyles.buttonText, { fontFamily: "body_200" }]}
                >
                  Need help?
                </ButtonText>
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={authStyles.container}>
          <Text style={authStyles.title}>Verifying...</Text>
          <Text>Checking if you're actually human 🤨</Text>
          <Turnstile setToken={setToken} />
        </View>
      )}
    </View>
  );
}
