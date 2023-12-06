import { StatusBar, Text, View } from "react-native";
import { useSession } from "../../context/AuthProvider";
import useSWR from "swr";
import { ScrollView } from "react-native-gesture-handler";
import { useUser } from "../../context/useUser";
import { useEffect, useState } from "react";

function Greeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    // morning, afternoon, evening, night
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
