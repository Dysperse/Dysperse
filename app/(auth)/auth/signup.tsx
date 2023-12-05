import { Link } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "../../../context/AuthProvider";
import { Text } from "react-native";

export default function Login() {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState(0);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

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
    >
      <Text>Coming soon!</Text>
    </ScrollView>
  );
}
