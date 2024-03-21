import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import Turnstile from "@/ui/turnstile";
import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { authStyles } from "../authStyles";

const PasswordContext = createContext(null);
export const usePasswordContext = () => useContext(PasswordContext);

const styles = StyleSheet.create({
  title: {
    marginBottom: 10,
    fontSize: 35,
  },
  subtitle: {
    marginBottom: 20,
    fontSize: 20,
    opacity: 0.6,
    textAlign: "center",
  },
  input: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    marginBottom: 20,
    fontSize: 20,
    width: "100%",
  },
});

const Email = ({ form }) => {
  const { handleNext } = usePasswordContext();
  const theme = useColorTheme();

  return (
    <>
      <Emoji
        emoji="1f62d"
        size={60}
        style={{
          marginTop: "auto",
          marginBottom: 10,
        }}
      />
      <Text weight={800} style={[styles.title, { color: theme[11] }]}>
        Forgot password?
      </Text>
      <Text style={[styles.subtitle, { color: theme[11] }]}>
        Enter your email and we'll send you a link to reset your password.
      </Text>
      <Controller
        control={form.control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextField
            variant="filled+outlined"
            style={styles.input}
            placeholder="Email or username"
            onChangeText={onChange}
            value={value || ""}
          />
        )}
      />
      <Button
        variant="filled"
        onPress={handleNext}
        style={{ marginTop: "auto", width: "100%", height: 70 }}
      >
        <ButtonText style={{ fontSize: 20 }} weight={700}>
          Continue
        </ButtonText>
        <Icon>arrow_forward_ios</Icon>
      </Button>
    </>
  );
};
const Captcha = ({ form }) => {
  const theme = useColorTheme();
  const { handleNext } = usePasswordContext();

  return (
    <>
      <Text weight={800} style={[styles.title, { color: theme[11] }]}>
        Verifying...
      </Text>
      <Text style={[styles.subtitle, { color: theme[11] }]}>
        Hang tight while we contemplate whether you're a human or not...
      </Text>
      <Turnstile
        setToken={(token) => {
          form.setValue("captchaToken", token);
          handleNext();
        }}
      />
    </>
  );
};
const Token = ({ form }) => {
  const theme = useColorTheme();
  const [loading, setLoading] = useState(true);
  const { handlePrev, setStep } = usePasswordContext();

  useEffect(() => {
    const values = form.getValues();
    if (!values.captchaToken) {
      setLoading(false);
      Toast.show({ type: "error" });
      handlePrev();
      return;
    }
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`, {
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        captchaToken: values.captchaToken,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setLoading(false);
        if (res.error === "ERROR_USER_NOT_FOUND") {
          Toast.show({ type: "error", text1: "User not found" });
          setStep(0);
        } else if (res.error) {
          Toast.show({ type: "error", text1: res.error });
          handlePrev();
        }
      });
  }, [form, handlePrev, setStep]);

  return loading ? (
    <Spinner />
  ) : (
    <>
      <Text weight={800} style={[styles.title, { color: theme[11] }]}>
        We sent you a code
      </Text>
      <Text style={[styles.subtitle, { color: theme[11] }]}>
        Check your email for a code and enter it here.
      </Text>
      <Controller
        control={form.control}
        name="token"
        render={({ field: { onChange, value } }) => (
          <TextField
            variant="filled+outlined"
            style={styles.input}
            placeholder="Verification code"
            onChangeText={onChange}
            value={value || ""}
          />
        )}
      />

      <Button
        variant="filled"
        onPress={handlePrev}
        style={{ marginTop: 10, width: "100%", height: 70 }}
      >
        <ButtonText style={{ fontSize: 20 }} weight={700}>
          Next
        </ButtonText>
        <Icon>arrow_back_ios</Icon>
      </Button>
    </>
  );
};
const Password = ({ form }) => {
  return <Text>Password</Text>;
};

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const [step, setStep] = useState(0);

  const form = useForm({
    defaultValues: {
      email: "",
      captchaToken: "",
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  const steps = [
    <Email form={form} key="1" />,
    <Captcha form={form} key="2" />,
    <Token form={form} key="3" />,
    <Password form={form} key="4" />,
  ];

  const handleBack = useCallback(() => {
    if (step === 0)
      if (router.canGoBack()) router.back();
      else router.push("/");
    else setStep(step - 1);
  }, [step]);

  const onSubmit = async (values) => {
    switch (step) {
      case 0:
        setStep(1);
        break;
      case 1:
        setStep(2);
        break;
    }
  };

  return (
    <PasswordContext.Provider
      value={{
        handleNext: form.handleSubmit(onSubmit, () => {
          Toast.show({
            type: "error",
            text1: "Please check your inputs and try again.",
          });
        }),
        handlePrev: () => setStep(step - 1),
        setStep,
      }}
    >
      <View
        style={[
          authStyles.container,
          { backgroundColor: theme[1] },
          breakpoints.md && authStyles.containerDesktop,
          breakpoints.md && {
            borderColor: theme[6],
          },
        ]}
      >
        <IconButton
          variant="outlined"
          size={55}
          icon="close"
          onPress={handleBack}
        />
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: 30,
            width: "100%",
          }}
        >
          {steps[step]}
        </View>
      </View>
    </PasswordContext.Provider>
  );
}
