import { Link, Stack } from "expo-router";
import { useAuth } from "../../../context/AuthProvider";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text, View, Spinner, Input, H1, H6, Button } from "tamagui";
import { useState } from "react";
import { ScrollView } from "tamagui";

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
        maxWidth: 500,
        margin: "auto",
      }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        gap: 10,
        margin: "auto",
      }}
      padding="$5"
      gap="$2"
    >
      <H1 textAlign="center">Welcome back!</H1>
      <Text marginBottom="$2" textAlign="center">
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
      <View flexDirection="row">
        <Link asChild href="/auth/signup">
          <Button
            size="$2"
            marginLeft="auto"
            style={{ textDecoration: "none" }}
            opacity={0.7}
            chromeless
          >
            Forgot ID?
          </Button>
        </Link>
        <Link asChild href="/auth/signup">
          <Button
            size="$2"
            style={{ textDecoration: "none" }}
            opacity={0.7}
            chromeless
          >
            Create an account
          </Button>
        </Link>
      </View>
    </ScrollView>
  );
}
