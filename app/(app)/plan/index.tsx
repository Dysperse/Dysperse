import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { getGreeting } from "../../../components/home/getGreeting";

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginTop: "auto",
    textAlign: "center",
  },
  subtitle: { textAlign: "center", fontSize: 30, opacity: 0.7 },
  buttonContainer: {
    padding: 20,
    marginTop: "auto",
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 700,
  },
  buttonText: { fontSize: 20 },
});

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const handleNext = () => router.push("/plan/1");
  const greeting = getGreeting();
  const { session } = useUser();

  return (
    <LinearGradient
      colors={[theme[2], theme[3], theme[4], theme[3], theme[2]]}
      style={styles.container}
    >
      <SystemBars style="light" />
      <Text
        style={[
          styles.title,
          {
            fontSize: breakpoints.md ? 40 : 30,
            color: theme[11],
            fontFamily: "serifText800",
          },
        ]}
      >
        {greeting}, {session.user.profile.name.split(" ")[0]}
      </Text>
      <Text style={[styles.subtitle, { color: theme[9] }]} weight={300}>
        Let's plan your day!
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleNext}
          backgroundColors={{
            pressed: theme[11],
            hovered: theme[10],
            default: theme[9],
          }}
          containerStyle={{ width: "100%" }}
          height={70}
        >
          <ButtonText
            style={[styles.buttonText, { color: theme[1] }]}
            onPress={handleNext}
            weight={800}
          >
            Start
          </ButtonText>
          <Icon style={{ color: theme[1] }} bold>
            east
          </Icon>
        </Button>
      </View>
    </LinearGradient>
  );
}

