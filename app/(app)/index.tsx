import { Text, View } from "react-native";
import { useSession } from "../../context/AuthProvider";
import useSWR from "swr";
import { ScrollView } from "react-native-gesture-handler";
import { useUser } from "../../context/useUser";

export default function Index() {
  const { signOut } = useSession();
  const { session, error } = useUser();

  return (
    <ScrollView>
      <Text>Good morning?</Text>
    </ScrollView>
  );
}
