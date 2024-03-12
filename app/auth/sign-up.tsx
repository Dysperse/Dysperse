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
import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { Customization } from "@/components/signup/Customization";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { Pressable, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Intro } from "../../components/signup/Intro";
import { Profile } from "../../components/signup/Profile";
import { authStyles } from "./authStyles";

const SignupContext = createContext(null);
export const useSignupContext = () => useContext(SignupContext);

const ColorPressable = ({ color, handleSelect }) => {
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
        <Text style={{ fontSize: 30, color: color.p[11] }} weight={700}>
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

const ColorPicker = ({ form }) => {
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
          fontSize: 30,
          textAlign: "center",
          marginBottom: 10,
          color: theme[11],
        }}
        weight={700}
      >
        Choose your theme
      </Text>
      <Text
        style={{
          textAlign: "center",
          opacity: 0.7,
          fontSize: 20,
          color: theme[11],
        }}
      >
        You've unlocked three themes. Unlock more by completing in-app
        achievements.
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
        style={{
          marginTop: "auto",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          height: 70,
        }}
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

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  const form = useForm({
    defaultValues: {
      broadnessPreference: 3,
      name: "",
      email: "",
      picture: "",
      password: "",
      theme: "mint",
      methods: [],
      birthday: [dayjs().year(), dayjs().month() + 1, dayjs().date()],
      bio: "",
    },
  });

  const selectedTheme = form.watch("theme");
  const theme = useColor(selectedTheme as any);
  const [step, setStep] = useState(0);

  const steps = [
    <Intro form={form} key="1" />,
    <Customization form={form} key="2" />,
    <Profile form={form} key="3" />,
    <ColorPicker form={form} key="4" />,
  ];

  const handleBack = useCallback(() => {
    if (step === 0)
      if (router.canGoBack()) router.back();
      else router.push("/");
    else setStep(step - 1);
  }, [step]);

  const { handleSubmit } = form;
  const onSubmit = (data) => {
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
            <View style={{ flexDirection: "row", gap: 10 }}>
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
            />
            {steps[step]}
          </View>
        </View>
      </SignupContext.Provider>
    </ColorThemeProvider>
  );
}
