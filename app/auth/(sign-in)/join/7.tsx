import { useSession } from "@/context/AuthProvider";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useSignupContext } from "./_layout";

export default function Page() {
  const theme = useColorTheme();
  const store = useSignupContext();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const { signIn } = useSession();

  const handleSignup = useCallback(async () => {
    try {
      if (success) return;
      setError(false);
      const data = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          body: JSON.stringify({
            ...store,
            timeZone: dayjs.tz.guess(),
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
      console.log(data);
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
    <View style={{ flexGrow: 1, justifyContent: "center" }}>
      <Text
        style={{
          fontFamily: "serifText700",
          fontSize: 45,
          marginTop: 10,
          color: theme[11],
        }}
      >
        Hang tight...
      </Text>
      <Text
        style={{
          opacity: 0.4,
          fontSize: 25,
          marginTop: 5,
          marginBottom: 15,
          color: theme[11],
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
          }}
        >
          <Spinner size={30} />
          {/* <Text style={{ fontFamily: "mono" }}>
            {JSON.stringify(store, null, 2)}
          </Text> */}
        </View>
      )}
    </View>
  );
}
