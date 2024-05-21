import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import Turnstile from "@/ui/turnstile";
import { router } from "expo-router";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, StyleSheet, View } from "react-native";
import { authStyles } from "../../../components/authStyles";

const styles = StyleSheet.create({
  title: {
    fontSize: 40,
    width: "100%",
    lineHeight: 50,
    marginVertical: 10,
    textAlign: "center",
  },
});

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.push("/");
  }, []);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      email: "",
      captchaToken: "",
    },
  });

  const onSubmit = useCallback(async (values) => {
    try {
      const data = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      ).then((res) => res.json());
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  return (
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
          width: "100%",
          padding: 20,
        }}
      >
        <Emoji emoji="1f631" style={{ marginTop: "auto" }} size={64} />
        <Text
          style={[
            styles.title,
            {
              paddingTop: 10,
              fontFamily: "serifText800",
            },
            !breakpoints.md && { textAlign: "center" },
          ]}
        >
          Forgot your password?
        </Text>
        <Text
          style={{
            fontSize: 20,
            textAlign: "center",
            marginBottom: 20,
            opacity: 0.6,
            color: theme[11],
          }}
          weight={500}
        >
          No worries! Enter your email or username and we'll send you a link to
          reset your password.
        </Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <TextField
              variant="filled+outlined"
              style={{
                paddingHorizontal: 30,
                paddingVertical: 20,
                fontSize: 20,
                width: "100%",
                borderColor: error ? "red" : theme[6],
                ...(Platform.OS === "web" && { outline: "none" }),
              }}
              placeholder="Email or username"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="email"
        />
        <Turnstile setToken={(token) => setValue("captchaToken", token)} />
        <Button
          style={{ marginTop: "auto", height: 64, width: "100%" }}
          variant="filled"
          onPress={handleSubmit(onSubmit)}
        >
          <ButtonText weight={900} style={{ fontSize: 20 }}>
            Send reset link
          </ButtonText>
          <Icon>east</Icon>
        </Button>
      </View>
    </View>
  );
}
