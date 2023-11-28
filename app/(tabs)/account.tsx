import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Accout() {
  const { setUser, user } = useAuth();
  
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Account</Text>
      <Text>{ user && user.name }</Text>
      <TouchableOpacity onPress={() => setUser(null)}>
        <Text>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}