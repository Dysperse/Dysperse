import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import Turnstile from "@/ui/turnstile";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function Page() {
  const theme = useColorTheme();
  const params = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View style={{ flexGrow: 1, justifyContent: "center" }}>
      <Text
        style={{
          fontFamily: "serifText700",
          fontSize: breakpoints.md ? 40 : 30,
          marginTop: 10,
          textAlign: "center",
          color: theme[11],
        }}
      >
        Are you a robot?
      </Text>
      <Text
        style={{
          opacity: 0.4,
          fontSize: breakpoints.md ? 25 : 20,
          marginTop: 5,
          marginBottom: 15,
          textAlign: "center",
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

