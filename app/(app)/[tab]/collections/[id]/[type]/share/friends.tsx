import { FriendsList } from "@/app/(app)/friends";
import { MenuButton } from "@/app/(app)/home";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const isDark = useDarkMode();
  const theme = useColorTheme();
  const { session, sessionToken } = useUser();
  const { id } = useLocalSearchParams();

  const handleSelectFriends = async (email) => {
    try {
      const res = await sendApiRequest(
        sessionToken,
        "POST",
        "space/collections/collection/share",
        {},
        {
          body: JSON.stringify({ email, id }),
        }
      );
      console.log("Response from sending invites:", res);
      if (res.error) throw new Error(res);
      Toast.show({ type: "success", text1: "Invites sent!" });
      router.back();
    } catch (e) {
      console.error("Error sending invites:", e.message);
      Toast.show({ type: "error" });
      setIsLoading(false);
    }
  };

  return (
    <>
      <MenuButton back />
      <View
        style={{
          marginTop: 90,
          paddingHorizontal: 25,
        }}
      >
        <Text
          style={{
            fontFamily: "serifText700",
            fontSize: 30,
          }}
        >
          Friends
        </Text>
      </View>

      <View style={{ paddingHorizontal: 25, marginTop: 10 }}>
        <TextField
          placeholder="Search friends..."
          value={search}
          onChangeText={setSearch}
          variant="filled"
          weight={800}
          style={{
            fontSize: 20,
            height: 60,
            textAlign: "center",
            borderRadius: 99,
          }}
        />
      </View>

      <FriendsList
        onSelect={(friend) => {
          setIsLoading(true);
          const email =
            friend.user?.email || friend.profile?.email || friend.email;
          if (email !== session.user?.email) handleSelectFriends(email);
        }}
        search={search}
      />

      {isLoading && (
        <BlurView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backgroundColor: addHslAlpha(theme[2], 0.6),
          }}
          tint={isDark ? "dark" : "light"}
        >
          <Spinner size={30} />
        </BlurView>
      )}
    </>
  );
}
