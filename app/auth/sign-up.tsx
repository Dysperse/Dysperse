import themes from "@/components/themes.json";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { Portal } from "@gorhom/portal";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { createContext, useCallback, useContext, useState } from "react";

import { Avatar } from "@/ui/Avatar";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { authStyles } from "./authStyles";

const SignupContext = createContext(null);
const useSignupContext = () => useContext(SignupContext);

const introStyles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: "auto",
    maxWidth: "100%",
    borderRadius: 20,
    width: 300,
  },
});
const Intro = () => {
  const { handleNext } = useSignupContext();
  const theme = useColorTheme();
  const { control } = useForm();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Icon size={60} style={{ marginBottom: 10, marginTop: "auto" }}>
        waving_hand
      </Icon>
      <Text
        style={{ fontSize: 30, color: theme[11], textAlign: "center" }}
        weight={900}
      >
        Welcome to Dysperse.
      </Text>
      <Text
        style={{
          color: theme[11],
          opacity: 0.7,
          fontSize: 20,
          textAlign: "center",
        }}
      >
        Let's make productivity work for you.
      </Text>
      <Controller
        rules={{ required: true }}
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <View
            style={[introStyles.inputContainer, { backgroundColor: theme[3] }]}
          >
            <TextField
              onBlur={onBlur}
              onChangeText={onChange}
              style={{
                flex: 1,
                height: "100%",
                shadowRadius: 0,
                paddingHorizontal: 20,
              }}
              onSubmitEditing={() => {
                if (value !== "") handleNext();
              }}
              value={value || ""}
              placeholder="What's your name?"
            />
            <IconButton
              disabled={value === ""}
              onPress={handleNext}
              size={55}
              icon="arrow_forward"
            />
          </View>
        )}
        name="name"
      />
    </View>
  );
};

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

const ColorPicker = () => {
  const theme = useColorTheme();
  const orange = useColor("orange");
  const grass = useColor("grass");
  const crimson = useColor("crimson");
  const { handleNext } = useSignupContext();
  const { width } = useWindowDimensions();
  const { setValue } = useFormContext();
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

const Customization = () => {
  const theme = useColorTheme();
  const { control } = useFormContext();

  const methods = [
    {
      icon: "timer",
      name: "Pomodoro",
      description:
        "Work for 25 minutes, then take a 5-minute break. Repeat 4 times, then take a 15-minute break.",
    },
    {
      icon: "crisis_alert",
      name: "Eisenhower matrix",
      description: "Prioritize tasks based on urgency and importance.",
    },
    {
      icon: "view_kanban",
      name: "Kanban",
      description:
        "Organize your tasks into columns. Move them around as you make progress.",
    },
    {
      icon: "transition_slide",
      name: "Traditional planner",
      description:
        "Plan the stuff you need to do each day and check them off as you go.",
    },
    {
      icon: "priority",
      name: "To-do list",
      description: "List all the things you need to do and check them off.",
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <Text
        style={{
          marginTop: "auto",
          fontSize: 30,
          marginBottom: 10,
          color: theme[11],
        }}
        weight={900}
      >
        What productivity methods do you already use?
      </Text>
      <Text
        style={{
          color: theme[11],
          opacity: 0.7,
          fontSize: 20,
          marginBottom: 30,
        }}
      >
        We'll incorporate them into your Dysperse experience.
      </Text>
      <Controller
        control={control}
        name="methods"
        render={() => (
          <View>
            {methods.map((method, i) => (
              <ListItemButton
                variant="outlined"
                key={i}
                style={{
                  flexDirection: "row",
                  marginBottom: 15,
                }}
              >
                <Avatar
                  icon={method.icon}
                  size={40}
                  style={{
                    backgroundColor: theme[3],
                  }}
                />
                <ListItemText
                  primary={method.name}
                  secondary={method.description}
                />
              </ListItemButton>
            ))}
          </View>
        )}
      />
      <Button
        onPress={() => {}}
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
    </ScrollView>
  );
};

const Profile = () => {
  return (
    <View>
      <Text>Dysperse is for all</Text>
    </View>
  );
};

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  const control = useForm({
    defaultValues: {
      broadnessPreference: 3,
      name: "",
      email: "",
      password: "",
      theme: "mint",
    },
  });

  const selectedTheme = control.watch("theme");
  const theme = useColor(selectedTheme as any);
  const [step, setStep] = useState(0);

  const steps = [
    <Intro key="1" />,
    <Customization key="2" />,
    <Profile key="3" />,
    <ColorPicker key="4" />,
  ];

  const handleBack = useCallback(() => {
    if (step === 0)
      if (router.canGoBack()) router.back();
      else router.push("/");
    else setStep(step - 1);
  }, [step]);

  return (
    <FormProvider {...control}>
      <ColorThemeProvider theme={theme}>
        <SignupContext.Provider
          value={{
            handleNext: () => setStep(step + 1),
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
    </FormProvider>
  );
}
