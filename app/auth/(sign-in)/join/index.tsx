import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSignupContext } from "../_layout";

function Intro() {
  const theme = useColorTheme();
  const [name, setName] = useState("");
  const store = useSignupContext();
  const params = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();

  useEffect(() => {
    store.name = name;
  }, [store, name]);

  useEffect(() => {
    console.log("params", params);
    if (params.name) store.name = params.name;
    if (params.email) {
      store.email = params.email;
      store.prefilledEmail = true;
    }
    if (params.appleAuthFillPassword) {
      store.appleAuthFillPassword = true;
    }
  }, [params, store]);

  return (
    <View
      style={{
        padding: 20,
        paddingHorizontal: 30,
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Animated.View entering={FadeIn.delay(300)}>
        <Text variant="eyebrow">1/5</Text>
        <Text
          style={{
            fontFamily: "serifText700",
            fontSize: breakpoints.md ? 40 : 30,
            marginTop: 10,
            color: theme[11],
          }}
        >
          Let's create your{"\n"}#dysperse account.
        </Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(600)}>
        <Text
          style={{
            opacity: 0.4,
            fontSize: breakpoints.md ? 25 : 20,
            marginBottom: 15,
            marginTop: 5,
            color: theme[11],
          }}
          weight={600}
        >
          What's your name?
        </Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(900)}>
        <TextField
          autoFocus
          variant="filled+outlined"
          placeholder="Barack Obama"
          onSubmitEditing={() => {
            if (name.trim()) {
              router.push("/auth/join/2");
            }
          }}
          style={{
            paddingHorizontal: 25,
            paddingVertical: 20,
            fontSize: 20,
            height: 65,
            borderRadius: 20,
            marginBottom: 20,
            fontFamily: "body_600",
            borderWidth: 0,
          }}
          onChangeText={setName}
          autoComplete="name"
        />
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(1200)}
        style={{ flexDirection: "row", gap: 10 }}
      >
        <Button
          height={65}
          variant={name.trim() ? "filled" : "outlined"}
          text={name.trim() ? "Next" : "Skip"}
          containerStyle={{ flex: 1 }}
          icon="east"
          iconPosition="end"
          bold
          backgroundColors={{
            default: addHslAlpha(theme[11], name.trim() ? 0.1 : 0),
            pressed: addHslAlpha(theme[11], 0.2),
            hovered: addHslAlpha(theme[11], 0.05),
          }}
          onPress={() => router.push("/auth/join/2")}
        />
      </Animated.View>
    </View>
  );
}

export default function Page() {
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      // onScrollBeginDrag={Keyboard.dismiss}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingTop: 90,
      }}
    >
      <Intro />
    </KeyboardAwareScrollView>
  );
}

