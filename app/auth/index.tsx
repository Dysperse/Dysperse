import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Linking, StyleSheet, View } from "react-native";
import { authStyles } from "./authStyles";

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const handleLoginPress = () => router.push("/auth/sign-in");
  const handleSignUpPress = () => router.push("/auth/sign-up");
  const openHomePage = () =>
    Linking.openURL("https://dysperse.com?utm_source=app");

  return (
    <View
      style={[
        authStyles.container,
        { backgroundColor: theme[1] },
        breakpoints.md && {
          maxWidth: 500,
          marginHorizontal: "auto",
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme[6],
          marginVertical: 20,
        },
      ]}
    >
      <LinearGradient
        colors={[theme[breakpoints.md ? 1 : 2], theme[1]]}
        style={[StyleSheet.absoluteFill]}
      />
      <Text style={[authStyles.title, !breakpoints.md && { fontSize: 40 }]}>
        We're here to{" "}
        <Text
          style={[
            authStyles.title,
            { color: theme[11] },
            !breakpoints.md && { fontSize: 40 },
          ]}
        >
          redefine productivity
        </Text>
        .
      </Text>
      <View style={authStyles.subtitleContainer}>
        {`Meet the`.split(" ").map((word, i) => (
          <Text key={i} style={authStyles.word}>
            {word}{" "}
          </Text>
        ))}
        <Chip
          dense
          label="Aesthetic"
          icon={<Icon>magic_button</Icon>}
          textStyle={authStyles.chipWord}
        />
        <Text style={authStyles.word}> </Text>
        <Chip
          dense
          icon={<Icon>airwave</Icon>}
          label="Minimalist"
          textStyle={authStyles.chipWord}
        />
        <Text style={authStyles.word}> and </Text>
        <Chip
          dense
          icon={<Icon>keyboard_double_arrow_up</Icon>}
          label="Sophisticated"
          textStyle={authStyles.chipWord}
        />
        <Text style={authStyles.word}> app you've been waiting for. </Text>
      </View>
      <Button
        variant="filled"
        style={authStyles.button}
        onPress={handleLoginPress}
      >
        <ButtonText style={authStyles.buttonText}>Sign in</ButtonText>
      </Button>
      <Button
        variant="filled"
        style={authStyles.button}
        onPress={handleSignUpPress}
      >
        <ButtonText style={authStyles.buttonText}>Create an account</ButtonText>
      </Button>
      <Button
        onPress={openHomePage}
        variant="outlined"
        style={[authStyles.button, { height: 60 }]}
      >
        <ButtonText
          style={[
            authStyles.buttonText,
            { fontFamily: "body_300", fontSize: 20, opacity: 0.6 },
          ]}
        >
          Visit home page
        </ButtonText>
      </Button>
    </View>
  );
}
