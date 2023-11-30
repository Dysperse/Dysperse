import { Text, Pressable, ScrollView } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { Link, router } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Accout() {
  const { session } = useAuth();

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text>Account</Text>
      <Text>{JSON.stringify(session)}</Text>
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
