import { useSession } from "@/context/AuthProvider";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useSignupContext } from "../_layout";

export default function Page() {
  const theme = useColorTheme();
  const store = useSignupContext();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const { signIn } = useSession();
  const breakpoints = useResponsiveBreakpoints();

  const handleSignup = useCallback(async () => {
    try {
      if (success) return;
      setError(false);
      const referredBy = await AsyncStorage.getItem("referredBy");

      const data = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          body: JSON.stringify({
            ...store,
            timeZone: dayjs.tz.guess(),
            referredBy: referredBy || null,
            birthday: [store.birthday?.month, store.birthday?.day],
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
      router.replace("/home");
    } catch (e) {
      setError(true);
    }
  }, [store, signIn, success]);

  useEffect(() => {
    handleSignup();
  }, [handleSignup]);

  return (
    <View
      style={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 20 }}
    >
      <Text
        style={{
          fontFamily: "serifText700",
          fontSize: breakpoints.md ? 45 : 35,
          marginTop: 10,
          color: theme[11],
          textAlign: "center",
        }}
      >
        Hang tight...
      </Text>
      <Text
        style={{
          opacity: 0.4,
          fontSize: breakpoints.md ? 25 : 20,
          marginTop: 5,
          marginBottom: 15,
          color: theme[11],
          textAlign: "center",
        }}
        weight={600}
      >
        We're creating your account!
      </Text>
      {error ? (
        <ErrorAlert />
      ) : (
        <View
          style={{
            backgroundColor: theme[2],
            padding: 20,
            borderRadius: 20,
            justifyContent: "center",
          }}
        >
          <Spinner size={30} />
        </View>
      )}
    </View>
  );
}

