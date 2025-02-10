import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";

function Content() {
  const theme = useColorTheme();
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const params = useLocalSearchParams();

  const [selected, setSelected] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const enabled =
    email.trim() && password.trim() && password === passwordConfirm;

  return (
    <View
      style={{
        padding: 20,
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Animated.View entering={FadeIn.delay(300)}>
        <Text variant="eyebrow">5/5</Text>
        <Text
          style={{
            fontFamily: "serifText700",
            fontSize: 45,
            marginTop: 10,
            color: theme[11],
          }}
        >
          One last thing...
        </Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(600)}>
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
          Enter your email and create a password
        </Text>
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(900)}
        style={{ gap: 10, marginTop: 10 }}
      >
        <Text variant="eyebrow">Email</Text>
        <TextField
          inputMode="email"
          variant="filled"
          placeholder="barackobama@gmail.com"
          onChangeText={setEmail}
        />
        <ListItemButton variant="filled">
          <ListItemText
            primary="I want to recieve annoying newsletters"
            secondary="We promise they're once a month and actually useful"
          />
          <Icon size={40}>toggle_on</Icon>
        </ListItemButton>
        <Text variant="eyebrow" style={{ marginTop: 30 }}>
          Password
        </Text>
        <TextField
          secureTextEntry
          variant="filled"
          placeholder="Pick something strong"
          onChangeText={setPassword}
        />
        <TextField
          secureTextEntry
          variant="filled"
          placeholder="Retype what you just entered above"
          onChangeText={setPasswordConfirm}
        />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(1400)} style={{ marginTop: 20 }}>
        <Button
          height={65}
          variant="filled"
          style={{ margin: 20 }}
          text="Finish"
          containerStyle={!enabled && { opacity: 0.6 }}
          icon="check"
          iconPosition="end"
          bold
          disabled={!enabled}
          onPress={() => {
            router.push({
              pathname: "/auth/join/6",
              params: { ...params },
            });
          }}
        />
        <Text style={{ textAlign: "center", opacity: 0.7, marginTop: 20 }}>
          By creating an account, you're 13+ and also agree with our{" "}
          <Text
            style={{ color: "#007AFF", textDecorationLine: "underline" }}
            onPress={() => {
              Linking.openURL("https://blog.dysperse.com/terms-of-service");
              setHasReadTerms(true);
            }}
          >
            terms
          </Text>{" "}
          and{" "}
          <Text
            style={{ color: "#007AFF", textDecorationLine: "underline" }}
            onPress={() => {
              Linking.openURL("https://blog.dysperse.com/privacy-policy");
              setHasReadTerms(true);
            }}
          >
            privacy policy
          </Text>{" "}
          which nobody ever reads.{" "}
          {hasReadTerms
            ? "\n\n Quite surprising that you actually read it. Good job!"
            : ""}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function Page() {
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <Content />
    </KeyboardAwareScrollView>
  );
}
