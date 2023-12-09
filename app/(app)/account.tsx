import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import Text from "@/ui/Text";
import { Image } from "expo-image";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

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
        <Image
          source={{ uri: session?.user?.Profile?.picture }}
          className="rounded-full w-16 h-16"
        />
        <Text>{JSON.stringify(session)}</Text>
        {error && <Text>Error</Text>}
      </ScrollView>
    </GestureHandlerRootView>
  );
}
