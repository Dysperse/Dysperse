import { Button } from "@/ui/Button";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, View } from "react-native";

export default function Email() {
  const theme = useColorTheme();
  const inputRef = useRef(null);
  const passwordRef = useRef(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
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

  return (
    <View style={{ flex: 1 }}>
      <IconButton
        icon="west"
        size={55}
        onPress={() =>
          router.canGoBack() ? router.back() : router.push("/auth")
        }
        style={{ marginBottom: 0 }}
      />
      <View style={{ gap: 10, flex: 1 }}>
        <Text
          style={{
            fontFamily: "serifText700",
            fontSize: 30,
            color: theme[11],
            marginTop: "auto",
            paddingHorizontal: 30,
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
                paddingHorizontal: 20,
                marginHorizontal: 30,
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
                color: theme[11],
                paddingHorizontal: 20,
                marginHorizontal: 30,
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
          containerStyle={{
            marginHorizontal: 30,
            borderRadius: 20,
          }}
          bold
        />
        <Button
          height={50}
          onPress={() => router.push("/auth/forgot-password")}
          isLoading={false}
          text="Need help?"
          containerStyle={{ marginBottom: "auto" }}
        />
      </View>
    </View>
  );
}
