import { Link, Stack } from "expo-router";
import { useAuth } from "../../../context/AuthProvider";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  Text,
  View,
  Spinner,
  Input,
  H1,
  H6,
  Button,
  ScrollView,
} from "tamagui";
import { useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const disabled = isLoading || !email.trim() || !password.trim();

  const login = () => {
    setIsLoading(true);

    // setUser({
    //   name: "John Doe",
    // });
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      style={{
        flexDirection: "column",
        maxWidth: 500,
        margin: "auto",
      }}
      contentContainerStyle={{
        rowGap: 10,
        flex: 1,
        flexGrow: 1,
      }}
      padding="$5"
    >
      <H1 marginTop="auto" textAlign="center">
        Welcome to Dysperse.
      </H1>
      <Text marginBottom="$2" textAlign="center">
        It's time to set the new standard for productivity.
      </Text>
      <Input
        value={email}
        onChangeText={(e) => setEmail(e)}
        style={{ width: "100%" }}
        disabled={isLoading}
        size="$4"
        flexShrink={0}
        borderWidth={2}
        placeholder="Email or username"
      />
      <Input
        secureTextEntry
        value={password}
        onChangeText={(e) => setPassword(e)}
        style={{ width: "100%" }}
        disabled={isLoading}
        flexShrink={0}
        size="$4"
        borderWidth={2}
        placeholder="Password"
      />

      <Input
        secureTextEntry
        value={password}
        onChangeText={(e) => setPassword(e)}
        style={{ width: "100%" }}
        disabled={isLoading}
        size="$4"
        flexShrink={0}
        borderWidth={2}
        placeholder="Confirm your password"
      />
      <Button
        onPress={login}
        disabled={disabled}
        theme="active"
        width="100%"
        flexShrink={0}
        size="$4"
        opacity={disabled ? 0.6 : 1}
      >
        {isLoading ? <Spinner /> : "Continue"}
      </Button>
      <Link asChild href="/auth/login">
        <Button
          size="$2"
          style={{ textDecoration: "none" }}
          width="100%"
          marginBottom="auto"
          opacity={0.7}
          chromeless
        >
          I already have an account
        </Button>
      </Link>
    </ScrollView>
  );
}
