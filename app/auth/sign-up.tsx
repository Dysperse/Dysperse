import themes from "@/components/themes.json";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { Portal } from "@gorhom/portal";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { Customization } from "@/components/signup/Customization";
import { useSession } from "@/context/AuthProvider";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import TextField from "@/ui/TextArea";
import Turnstile from "@/ui/turnstile";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { Pressable, useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { inIframe } from ".";
import { authStyles } from "../../components/authStyles";
import { Intro } from "../../components/signup/Intro";
import { Profile } from "../../components/signup/Profile";
import { TaskCreator } from "../../components/signup/TaskCreator";

const SignupContext = createContext(null);
export const useSignupContext = () => useContext(SignupContext);

const ColorPressable = ({
  color,
  handleSelect,
}: {
  color: { p: Record<string, string>; n: string };
  handleSelect: (name: string) => void;
}) => {
  const { selectedTheme } = useSignupContext();
  const interactionState = useSharedValue<"active" | "hovered" | null>(null);

  const style = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(
          interactionState.value === "active"
            ? 0.98
            : interactionState.value === "hovered"
            ? 1.02
            : 1,
          {
            stiffness: 400,
            damping: 10,
          }
        ),
      },
    ],
    flex: 1,
  }));

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <AnimatedPressable
      key={color.n}
      style={style}
      onPress={() => handleSelect(color.n)}
      onPressIn={() => (interactionState.value = "active")}
      onPressOut={() => (interactionState.value = null)}
      onHoverIn={() => (interactionState.value = "hovered")}
      onHoverOut={() => (interactionState.value = null)}
    >
      <LinearGradient
        colors={[color.p[4], color.p[5], color.p[6]]}
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingHorizontal: 20,
          alignItems: "center",
          flexDirection: "row",
          gap: 10,
          borderRadius: 20,
        }}
      >
        <Image
          source={{ uri: `https://assets.dysperse.com/themes/${color.n}.svg` }}
          style={{ width: 40, height: 40 }}
        />
        <Text style={{ fontSize: 20, color: color.p[11] }} weight={700}>
          {themes[color.n].name}
        </Text>
        <Icon
          size={40}
          style={{ color: color.p[11] }}
          filled={selectedTheme === color.n}
        >
          {selectedTheme === color.n
            ? "check_circle"
            : "radio_button_unchecked"}
        </Icon>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const ColorPicker = ({ form }: { form: UseFormReturn<any> }) => {
  const theme = useColorTheme();
  const orange = useColor("orange");
  const grass = useColor("grass");
  const crimson = useColor("crimson");
  const { handleNext } = useSignupContext();
  const { width } = useWindowDimensions();
  const { setValue } = form;
  const barPosition = useSharedValue(-width);

  const barStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: barPosition.value }],
      width: 300,
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
    };
  });

  const handleSelect = (name) => {
    setValue("theme", name);
    barPosition.value = -width;
    barPosition.value = withSpring(width * 1.5, {
      stiffness: 70,
      damping: 20,
    });
  };

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  if (inIframe()) return <Redirect href="/auth" />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Portal>
        <Animated.View style={barStyle}>
          <LinearGradient
            colors={["transparent", addHslAlpha(theme[7], 0.1), "transparent"]}
            style={{ flex: 1, transform: [{ skewX: "-10deg" }] }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </Portal>
      <Text
        style={{
          fontSize: 40,
          marginBottom: 5,
          color: theme[11],
          fontFamily: "serifText800",
        }}
        weight={700}
      >
        Choose your theme
      </Text>
      <Text
        style={{
          opacity: 0.7,
          fontSize: 20,
          color: theme[11],
        }}
      >
        Dysperse has over 30+ themes to choose from. Here's 3 for now...
      </Text>
      <View style={{ gap: 20, flex: 1, paddingVertical: 20 }}>
        {[
          { p: orange, n: "orange" },
          { p: grass, n: "grass" },
          { p: crimson, n: "crimson" },
        ].map((color, i) => (
          <ColorPressable key={i} color={color} handleSelect={handleSelect} />
        ))}
      </View>
      <Button
        onPress={handleNext}
        containerStyle={{
          marginTop: "auto",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        }}
        height={70}
        variant="filled"
      >
        <ButtonText weight={900} style={{ fontSize: 20 }}>
          Next
        </ButtonText>
        <Icon bold style={{ marginLeft: 10 }}>
          arrow_forward
        </Icon>
      </Button>
    </View>
  );
};

export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const useDebouncedValue = (inputValue, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(inputValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, delay]);

  return debouncedValue;
};

const LoadingPage = ({ form }: { form: UseFormReturn<any> }) => {
  const theme = useColorTheme();
  const { getValues } = form;
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signIn } = useSession();

  const handleSignup = useCallback(async () => {
    try {
      if (success) return;
      setError(false);
      const values = getValues();
      const data = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          body: JSON.stringify({
            ...values,
            timeZone: dayjs.tz.guess(),
          }),
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Host: process.env.EXPO_PUBLIC_API_URL.replace(
              "https://",
              ""
            ).replace("http://", ""),
          },
          mode: "cors",
          keepalive: true,
        }
      ).then((res) => res.json());
      if (data.error) throw new Error(data.error);
      setSuccess(true);
      signIn(data.id);
      router.replace("/");
    } catch (e) {
      setError(true);
    }
  }, [getValues, signIn, success]);

  useEffect(() => {
    handleSignup();
  }, [handleSignup]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          marginBottom: 10,
          color: theme[11],
          marginTop: "auto",
          textAlign: "center",
        }}
        weight={900}
      >
        {error ? "Something went wrong" : "Almost there!"}
      </Text>
      <Text
        style={{
          fontSize: 20,
          color: theme[11],
          opacity: 0.7,
          marginBottom: "auto",
          textAlign: "center",
        }}
      >
        {error
          ? "Well, that sucks — maybe try again?"
          : "Hang tight while we're bringing your productivity superpowers to life. This might take a while."}
      </Text>
      <Button style={{ height: 60 }} variant="filled" isLoading={!error}>
        <ButtonText weight={900} style={{ fontSize: 20 }}>
          Retry
        </ButtonText>
      </Button>
    </View>
  );
};

const VerificationPage = ({ form }: { form: UseFormReturn<any> }) => {
  const theme = useColorTheme();
  const { setValue } = form;
  const { handleNext } = useSignupContext();

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 55,
          width: "100%",
          lineHeight: 55,
          paddingTop: 10,
          textAlign: "center",
          fontFamily: "serifText800",
        }}
        weight={900}
      >
        Verifying...
      </Text>
      <Text
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          rowGap: 10,
          fontSize: 20,
          marginBottom: 10,
          color: theme[11],
          textAlign: "center",
          opacity: 0.6,
        }}
        weight={700}
      >
        Are you a human!? Let's find out...
      </Text>
      <Turnstile
        setToken={(t) => {
          setValue("captchaToken", t);
          handleNext();
        }}
      />
    </View>
  );
};

const Password = ({ form }: { form: UseFormReturn<any> }) => {
  const theme = useColorTheme();
  const { getValues } = form;
  const { handleNext } = useSignupContext();

  return (
    <ScrollView centerContent style={{ flex: 1, padding: 20 }}>
      <Text
        style={{
          fontSize: 40,
          marginBottom: 5,
          color: theme[11],
          fontFamily: "serifText800",
        }}
        weight={900}
      >
        Create a password
      </Text>
      <Text
        style={{
          fontSize: 20,
          opacity: 0.7,
          marginBottom: 20,
          color: theme[11],
        }}
        weight={300}
      >
        Make sure it's at least 8 characters long, and it's something which
        nobody can't easily guess.
      </Text>
      <Controller
        rules={{
          required: true,
          validate: (v) => v.length >= 8,
        }}
        name="password"
        control={form.control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            value={value || ""}
            onChangeText={onChange}
            secureTextEntry
            variant="filled+outlined"
            placeholder="Password"
            style={[{ marginBottom: 10 }, error && { borderColor: "red" }]}
          />
        )}
      />
      <Controller
        rules={{
          required: true,
          validate: () =>
            getValues("confirmPassword") === getValues("password"),
        }}
        name="confirmPassword"
        control={form.control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            value={value || ""}
            onChangeText={onChange}
            secureTextEntry
            variant="filled+outlined"
            placeholder="Confirm password"
            style={[{ marginBottom: 10 }, error && { borderColor: "red" }]}
          />
        )}
      />
      <Button
        height={60}
        containerStyle={{ marginTop: "auto" }}
        variant="filled"
        onPress={handleNext}
      >
        <ButtonText weight={900} style={{ fontSize: 20 }}>
          Finish
        </ButtonText>
        <Icon>check</Icon>
      </Button>
    </ScrollView>
  );
};

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  const params = useLocalSearchParams();
  const form = useForm({
    defaultValues: {
      name: params.name || "",
      email: params.email || "",
      picture: params.picture || "",
      password: "",
      confirmPassword: "",
      theme: "mint",
      allowMarketingEmails: true,
      isGoogle: false,
      methods: [],
      birthday: [dayjs().year(), dayjs().month() + 1, dayjs().date()],
      tasks: ["", "", ""],
      bio: "",
      captchaToken: "",
    },
  });

  const selectedTheme = form.watch("theme");
  const theme = useColor(selectedTheme as any);
  const [step, setStep] = useState(0);

  const steps = [
    <Intro form={form} key="1" />,
    <Customization form={form} key="2" />,
    <Profile form={form} key="3" />,
    <TaskCreator form={form} key="4" />,
    <ColorPicker form={form} key="5" />,
    <Password form={form} key="6" />,
  ];

  const handleBack = useCallback(() => {
    if (step === 0)
      if (router.canGoBack()) router.back();
      else router.push("/");
    else setStep(step - 1);
  }, [step]);

  const { handleSubmit } = form;
  const onSubmit = () => {
    setStep(step + 1);
  };

  return (
    <ColorThemeProvider setHTMLAttributes theme={theme}>
      <SignupContext.Provider
        value={{
          handleNext: handleSubmit(onSubmit, () => {
            Toast.show({
              type: "error",
              text1: "Please check your inputs and try again.",
            });
          }),
          handleBack,
          selectedTheme,
        }}
      >
        <View style={{ backgroundColor: theme[2], flex: 1 }}>
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
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                padding: 10,
                paddingHorizontal: 5,
                paddingBottom: 0,
              }}
            >
              {["", ...steps].map((t, i) => (
                <LinearGradient
                  colors={
                    i <= step ? [theme[9], theme[8]] : [theme[3], theme[3]]
                  }
                  key={i}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 9,
                  }}
                />
              ))}
            </View>
            <IconButton
              variant="outlined"
              size={55}
              icon={step === 0 ? "close" : "arrow_back"}
              onPress={handleBack}
              disabled={step === steps.length + 1}
            />
            {steps[step]}
            {step === steps.length && <VerificationPage form={form} />}
            {step === steps.length + 1 && <LoadingPage form={form} />}
          </View>
        </View>
      </SignupContext.Provider>
    </ColorThemeProvider>
  );
}

