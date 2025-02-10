import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import Turnstile from "@/ui/turnstile";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function Page() {
  const theme = useColorTheme();
  const params = useLocalSearchParams();

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
        Are you a robot?
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
        Let's find out!
      </Text>
      <View
        style={{
          width: 300,
          marginRight: "auto",
        }}
      >
        <Turnstile
          setToken={(token) =>
            router.replace({
              pathname: "/auth/join/7",
              params: { ...params, token },
            })
          }
        />
      </View>
    </View>
  );
}
