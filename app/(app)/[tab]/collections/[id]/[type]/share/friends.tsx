import { FriendsList } from "@/app/(app)/friends";
import EmailFriendPage from "@/app/(app)/friends/search";
import { MenuButton } from "@/app/(app)/home";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { showErrorToast } from "@/utils/errorToast";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const isDark = useDarkMode();
  const theme = useColorTheme();
  const { session, sessionToken } = useUser();
  const { id } = useLocalSearchParams();

  const [view, setView] = useState<"friends" | "email">("friends");

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
      if (res.error) throw new Error(res);
      toast.success("Invites sent!");
      router.back();
    } catch (e) {
      console.error("Error sending invites:", e.message);
      showErrorToast();
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

      <View style={{ paddingHorizontal: 25, marginTop: 10, gap: 10 }}>
        {view === "friends" && (
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
        )}
        <Button
          onPress={() =>
            setView((t) => (t === "friends" ? "email" : "friends"))
          }
          large
          variant="outlined"
          icon={view === "friends" ? "email" : "west"}
          containerStyle={view === "email" && { marginRight: "auto" }}
          text={view === "friends" ? "Invite by email" : "Search friends"}
        />
      </View>

      {view === "friends" ? (
        <FriendsList
          onSelect={(friend) => {
            const email =
              friend.user?.email || friend.profile?.email || friend.email;
            if (email === session.user?.email) {
              toast.error("You can't invite yourself...");
              return;
            }
            setIsLoading(true);
            handleSelectFriends(email);
          }}
          search={search}
        />
      ) : (
        <EmailFriendPage
          collection
          onSelect={(email) => handleSelectFriends(email)}
        />
      )}

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

