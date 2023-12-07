import { Text, View } from "react-native";
import { useSession } from "@/context/AuthProvider";
import useSWR from "swr";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { useUser } from "@/context/useUser";

export default function Index() {
  const { signOut } = useSession();
  const { session, error } = useUser();

  return (
    <GestureHandlerRootView>
      <ScrollView>
        <Text
          onPress={() => {
            // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
            signOut();
          }}
        >
          Sign out
        </Text>
        <Text>{JSON.stringify(session)}</Text>
        {error && <Text>Error</Text>}
      </ScrollView>
    </GestureHandlerRootView>
  );
}
