import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import NavigationBar from "@/ui/NavigationBar";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { authStyles } from "./authStyles";

export default function Page() {
  const theme = useColorTheme();

  const handleLoginPress = () => router.push("/auth/sign-in");

  return (
    <View style={[authStyles.container, { backgroundColor: theme[1] }]}>
      <LinearGradient
        colors={[theme[2], theme[1]]}
        style={[StyleSheet.absoluteFill]}
      />
      <NavigationBar color={theme[1]} />
      <Text heading style={authStyles.title}>
        We're here to{" "}
        <Text heading style={[authStyles.title, { color: theme[11] }]}>
          redefine productivity
        </Text>
        .
      </Text>
      <View style={authStyles.subtitleContainer}>
        {`To-do lists don't work. And Dysperse isn't that. Meet the`
          .split(" ")
          .map((word, i) => (
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
      <Button variant="filled" style={authStyles.button}>
        <ButtonText style={authStyles.buttonText}>Create an account</ButtonText>
      </Button>
    </View>
  );
}
