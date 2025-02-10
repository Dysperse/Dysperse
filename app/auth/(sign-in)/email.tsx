import { Button } from "@/ui/Button";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, useWindowDimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Email() {
  const theme = useColorTheme();
  const inputRef = useRef(null);
  const passwordRef = useRef(null);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
    },
  });
  const onFinish = () => {
    setTimeout(handleSubmit, 100);
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      inputRef.current.setAttribute("name", "email");
      passwordRef.current.setAttribute("name", "password");
    }
  });

  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

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
          fontSize: 45,
          marginTop: 10,
          marginBottom: 10,
          paddingHorizontal: 10,
          color: theme[11],
        }}
      >
        Sign in with email
      </Text>
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
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
            placeholder="Email or username..."
            onBlur={onBlur}
            onChangeText={onChange}
            autoFocus
            onSubmitEditing={onFinish}
            value={value}
            variant="filled+outlined"
          />
        )}
        name="email"
      />
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
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
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={onFinish}
            value={value}
            inputRef={passwordRef}
            variant="filled+outlined"
          />
        )}
        name="password"
      />
      <Button
        variant="filled"
        height={60}
        onPress={onFinish}
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
