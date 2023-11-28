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
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 500,
        margin: "auto",
        textAlign: "center",
      }}
      contentContainerStyle={{
        rowGap: 10,
      }}
      padding="$5"
    >
      <H1>Welcome to Dysperse.</H1>
      <Text marginBottom="$2">
        It's time to set the new standard for productivity.
      </Text>
      <Input
        value={email}
        onChangeText={(e) => setEmail(e)}
        style={{ width: "100%" }}
        disabled={isLoading}
        size="$4"
        borderWidth={2}
        placeholder="Email or username"
      />
      <Input
        secureTextEntry
        value={password}
        onChangeText={(e) => setPassword(e)}
        style={{ width: "100%" }}
        disabled={isLoading}
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
        borderWidth={2}
        placeholder="Confirm your password"
      />
      <Button
        onPress={login}
        disabled={disabled}
        theme="active"
        width="100%"
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
          opacity={0.7}
        >
          I already have an account
        </Button>
      </Link>
    </ScrollView>
  );
}
