import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import Text from "@/ui/Text";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { signOut } = useSession();
  const { session, error } = useUser();
  const insets = useSafeAreaInsets();

  return (
    <>
      <ScrollView style={{ paddingTop: insets.top + 64 }}>
        <Text
          onPress={() => {
            signOut();
          }}
        >
          Sign out
        </Text>
        <Link replace href="/">
          GO HOME
        </Link>
        <Image
          source={{ uri: session?.user?.Profile?.picture }}
          className="rounded-full w-16 h-16"
        />
        {/* <Text>{JSON.stringify(session)}</Text> */}
        {error && <Text>Error</Text>}
      </ScrollView>
    </>
  );
}
