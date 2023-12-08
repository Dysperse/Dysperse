import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { useEffect, useState } from "react";
import { StatusBar, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

function Greeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else if (hour < 22) {
      setGreeting("Good evening");
    } else {
      setGreeting("Good night");
    }
  }, []);

  return (
    <Text style={{ fontFamily: "heading" }} className="uppercase text-5xl mt-5">
      {greeting}
    </Text>
  );
}

export default function Index() {
  const { signOut } = useSession();
  const { session, error } = useUser();

  return (
    <ScrollView className="p-5">
      <StatusBar barStyle="dark-content" />
      <Greeting />
    </ScrollView>
  );
}
