import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { Link, router } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "tamagui";

export default function Accout() {
  const { setUser, user } = useAuth();

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text>Account</Text>
      <Text>{JSON.stringify(user)}</Text>
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.removeItem("session");
          router.push("/auth/login");
        }}
      >
        <Text>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
