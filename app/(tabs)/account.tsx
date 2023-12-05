import { Text, Pressable, ScrollView } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { Link, router } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
const Tab = createBottomTabNavigator();

function Screen1() {
  return <Text>Hi</Text>;
}
function Screen2() {
  return <Text>Hi2</Text>;
}

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Screen1} />
      <Tab.Screen name="Settings" component={Screen2} />
    </Tab.Navigator>
  );
}

export default function Accout() {
  // const { session } = useAuth();

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text>Account!</Text>
      {/* <Text>{JSON.stringify(session)}</Text> */}
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.removeItem("session");
          router.push("/auth/login");
        }}
      >
        <Text>Log out</Text>
      </TouchableOpacity>
      <MyTabs />
    </ScrollView>
  );
}
