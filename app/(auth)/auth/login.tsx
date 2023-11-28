import { Link, Stack } from "expo-router";
import { useAuth } from "../../../context/AuthProvider";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text, View, Spinner, Input, H1, H6, Button } from "tamagui";
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
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: 500,
        margin: "auto",
        textAlign: "center",
      }}
      padding="$5"
      gap="$2"
    >
      <H1>Welcome back!</H1>
      <Text marginBottom="$2">
        We're so excited to see you again! Please sign in with your Dysperse ID.
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
      <Link asChild href="/auth/signup">
        <Button
          size="$2"
          style={{ textDecoration: "none" }}
          width="100%"
          opacity={0.7}
        >
          Create an account
        </Button>
      </Link>
    </View>
  );
}
