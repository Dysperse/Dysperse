import { useSession } from "@/context/AuthProvider";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import Turnstile from "@/ui/turnstile";
import { showErrorToast } from "@/utils/errorToast";
import * as Device from "expo-device";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { toast } from "sonner-native";
import { authStyles } from "../../../../../components/authStyles";

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
    height: 60,
    paddingHorizontal: 20,
    fontFamily: "body_600",
    borderWidth: 0,
    marginBottom: 20,
    fontSize: 20,
    width: "100%",
  },
});

const Email = ({ form }: any) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { handleNext } = usePasswordContext();

  return (
    <>
      <Text
        style={[
          styles.title,
          {
            marginTop: "auto",
            paddingTop: 10,
            fontFamily: "serifText700",
            color: theme[11],
            textAlign: "center",
          },
        ]}
      >
        Forgot password?
      </Text>
      <Text
        style={[
          authStyles.subtitleContainer,
          {
            color: theme[11],
            textAlign: breakpoints.md ? undefined : "center",
            opacity: 0.6,
          },
        ]}
        weight={500}
      >
        Enter your email and we'll send{"\n"}you a link to reset your password.
      </Text>
      <Controller
        control={form.control}
        name="email"
        rules={{ required: true }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            variant="filled+outlined"
            style={[
              styles.input,
              error && { borderColor: "red" },
              { marginTop: 10 },
            ]}
            placeholder="Email..."
            onChangeText={onChange}
            value={value || ""}
          />
        )}
      />
      <Button
        variant="filled"
        onPress={handleNext}
        height={70}
        containerStyle={{ marginTop: "auto", width: "100%" }}
      >
        <ButtonText style={{ fontSize: 20 }} weight={700}>
          Continue
        </ButtonText>
        <Icon>arrow_forward_ios</Icon>
      </Button>
    </>
  );
};
const Captcha = ({ form }: any) => {
  const theme = useColorTheme();
  const { handleNext } = usePasswordContext();

  return (
    <>
      <Text weight={800} style={[styles.title, { color: theme[11] }]}>
        Verifying...
      </Text>
      <Text
        style={[
          {
            paddingHorizontal: 0,
            fontSize: 20,
            marginBottom: 10,
            color: theme[11],
            opacity: 0.6,
          },
        ]}
      >
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
const Token = ({ form }: any) => {
  const theme = useColorTheme();
  const [loading, setLoading] = useState(true);
  const { setStep, handleNext } = usePasswordContext();

  useEffect(() => {
    const values = form.getValues();
    if (values.captchaToken === "SENT") {
      setLoading(false);
      return;
    }
    if (!values.captchaToken) {
      setLoading(false);
      showErrorToast();
      setStep(1);
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
          toast.error("User not found");
          setStep(0);
        } else if (res.error) {
          toast.error(res.error);
          setStep(1);
        } else if (!res.error) {
          form.setValue("captchaToken", "SENT");
        }
      })
      .catch(() => {
        setLoading(false);
        showErrorToast();
        setStep(0);
      });
  }, [form, setStep]);

  return loading ? (
    <Spinner />
  ) : (
    <>
      <Text
        weight={800}
        style={[
          styles.title,
          {
            fontFamily: "serifText700",
            color: theme[11],
          },
        ]}
      >
        We sent you a code
      </Text>
      <Text style={[styles.subtitle, { textAlign: "left", color: theme[11] }]}>
        Check your email for a code and enter it here.
      </Text>
      <Controller
        control={form.control}
        rules={{ required: true }}
        name="token"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            variant="filled+outlined"
            style={[styles.input, error && { borderColor: "red" }]}
            placeholder="Verification code"
            onChangeText={onChange}
            value={value || ""}
          />
        )}
      />

      <Button
        variant="filled"
        onPress={handleNext}
        height={70}
        containerStyle={{ marginTop: 10, width: "100%" }}
      >
        <ButtonText style={{ fontSize: 20 }} weight={700}>
          Next
        </ButtonText>
        <Icon>arrow_forward_ios</Icon>
      </Button>
    </>
  );
};
const Password = ({ form }: any) => {
  const theme = useColorTheme();
  const { handleNext } = usePasswordContext();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Text
        weight={800}
        style={[
          styles.title,
          {
            fontFamily: "serifText700",
            color: theme[11],
          },
        ]}
      >
        Reset your password
      </Text>
      <Text style={[styles.subtitle, { color: theme[11], textAlign: "left" }]}>
        Enter your new password and confirm it. Make sure it's at least 8
        characters long.
      </Text>
      <Controller
        control={form.control}
        rules={{ required: true, minLength: 8 }}
        name="password"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            variant="filled+outlined"
            style={[styles.input, error && { borderColor: "red" }]}
            placeholder="New password"
            onChangeText={onChange}
            value={value || ""}
          />
        )}
      />
      <Button
        variant="filled"
        isLoading={loading}
        onPress={() => {
          setLoading(true);
          handleNext();
        }}
        height={70}
        containerStyle={{ marginTop: 10, width: "100%" }}
      >
        <ButtonText style={{ fontSize: 20 }} weight={700}>
          Reset password
        </ButtonText>
        <Icon>arrow_forward_ios</Icon>
      </Button>
    </>
  );
};

export default function Page() {
  const [step, setStep] = useState(0);

  const form = useForm({
    defaultValues: {
      email: "",
      captchaToken: "",
      token: "",
      password: "",
    },
  });
  const { signIn } = useSession();

  const steps = [
    <Email form={form} key="1" />,
    <Captcha form={form} key="2" />,
    <Token form={form} key="3" />,
    <Password form={form} key="4" />,
  ];

  const onSubmit = async (values) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const data = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            deviceType: Device.deviceType,
            deviceName:
              Device.deviceName ||
              (Platform.OS === "web"
                ? navigator.userAgent.split("(")[1].split(";")[0]
                : "Unknown device"),
          }),
        }
      ).then((res) => res.json());
      if (data.error) {
        toast.error("Please check your inputs and try again.");
        setStep(2);
      } else {
        toast.success("Password changed!");
        signIn(data.id);
        router.replace("/home");
      }
    }
  };

  return (
    <PasswordContext.Provider
      value={{
        handleNext: form.handleSubmit(onSubmit, () => {
          toast.error("Please check your inputs and try again.");
        }),
        handlePrev: () => setStep(step - 1),
        setStep,
      }}
    >
      <KeyboardAwareScrollView
        style={[{ paddingHorizontal: 0 }]}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            justifyContent: "center",
            flex: 1,
            width: "100%",
          }}
        >
          {steps[step]}
        </View>
      </KeyboardAwareScrollView>
    </PasswordContext.Provider>
  );
}

