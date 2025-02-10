import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLoginContext } from "./_layout";

export default function Email() {
  const theme = useColorTheme();
  const inputRef = useRef(null);
  const passwordRef = useRef(null);
  const breakpoints = useResponsiveBreakpoints();

  const store = useLoginContext();

  useEffect(() => {
    if (Platform.OS === "web") {
      inputRef.current.setAttribute("name", "email");
      passwordRef.current.setAttribute("name", "password");
    }
  });

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        gap: 10,
        flexGrow: 1,
        justifyContent: "center",
      }}
    >
      <Button
        dense
        onPress={() =>
          router.canGoBack() ? router.back() : router.push("/auth")
        }
        text="Back"
        bold
        icon="west"
        style={{ gap: 10 }}
        iconStyle={{ marginTop: -3 }}
        containerStyle={{ marginTop: "auto", marginRight: "auto" }}
      />
      <Text
        style={{
          fontFamily: "serifText700",
          fontSize: breakpoints.md ? 40 : 30,
          marginTop: 10,
          marginBottom: 10,
          paddingHorizontal: 10,
          color: theme[11],
        }}
      >
        Sign in with email
      </Text>
      <TextField
        style={{
          height: 60,
          fontFamily: "body_600",
          borderRadius: 20,
          fontSize: 20,
          color: theme[11],
          marginHorizontal: 10,
          paddingHorizontal: 20,
        }}
        inputRef={inputRef}
        onSubmitEditing={() => passwordRef.current.focus()}
        placeholder="Email or username..."
        onChangeText={(t) => (store.email = t)}
        autoFocus
        variant="filled+outlined"
        // ios autofill
        importantForAutofill="yes"
        autoComplete="email"
      />
      <TextField
        style={{
          height: 60,
          fontFamily: "body_600",
          borderRadius: 20,
          fontSize: 20,
          marginHorizontal: 10,
          color: theme[11],
          paddingHorizontal: 20,
        }}
        placeholder="Password..."
        secureTextEntry
        onChangeText={(t) => (store.email = t)}
        inputRef={passwordRef}
        variant="filled+outlined"
        autoComplete="current-password"
      />
      <Button
        variant="filled"
        height={60}
        onPress={() => router.push("/auth/sign-in/captcha")}
        isLoading={false}
        text="Continue"
        icon="east"
        iconPosition="end"
        large
        containerStyle={{ borderRadius: 20, marginHorizontal: 10 }}
        bold
      />
      <Button
        height={50}
        onPress={() => router.push("/auth/forgot-password")}
        isLoading={false}
        text="Need help?"
        containerStyle={{ marginBottom: "auto" }}
      />
    </KeyboardAwareScrollView>
  );
}
