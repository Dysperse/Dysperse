import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSignupContext } from "./_layout";

function Intro() {
  const theme = useColorTheme();
  const [name, setName] = useState("");
  const store = useSignupContext();
  const breakpoints = useResponsiveBreakpoints();

  useEffect(() => {
    store.name = name;
  }, [store, name]);

  return (
    <View
      style={{
        padding: 20,
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
          Well, hello there.
        </Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(600)}>
        <Text
          style={{
            opacity: 0.4,
            fontSize: breakpoints.md ? 25 : 20,
            marginBottom: 15,
            color: theme[11],
          }}
          weight={600}
        >
          What's your name?
        </Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(900)}>
        <TextField
          variant="filled+outlined"
          placeholder="Barack Obama"
          style={{
            padding: 20,
            fontSize: 20,
            height: 65,
            borderRadius: 20,
            marginBottom: 20,
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
          variant="filled"
          style={{ margin: 20 }}
          text="Next"
          containerStyle={[!name.trim() && { opacity: 0.6 }, { flex: 1 }]}
          icon="east"
          iconPosition="end"
          bold
          disabled={!name.trim()}
          onPress={() => router.push("/auth/join/2")}
        />
      </Animated.View>
    </View>
  );
}

export default function Page() {
  return (
    <KeyboardAwareScrollView
      onScrollBeginDrag={Keyboard.dismiss}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <Intro />
    </KeyboardAwareScrollView>
  );
}

