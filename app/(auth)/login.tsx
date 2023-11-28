import { Link } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Login() {
  const { setUser } = useAuth();

  const login = () => {
    setUser({
      name: "John Doe",
    });
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <TouchableOpacity onPress={login}>
        <Text>Login</Text>
      </TouchableOpacity>
    </View>
  );
}
