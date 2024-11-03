import { useDeviceNotificationState } from "@/app/(app)/settings/customization/notifications";
import { useHotkeys } from "@/helpers/useHotKeys";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useRef } from "react";
import { View } from "react-native";
import useSWR from "swr";

export default function TabFriendModal() {
  const t = useDeviceNotificationState();
  const ref = useRef<BottomSheetModal>(null);
  const { data, mutate } = useSWR(["user/notifications"]);

  const show = useCallback(async () => {
    if (t === "prompt") {
      const hasPrompted = await AsyncStorage.getItem("closedTabFriendPrompt");
      if (hasPrompted === null) {
        ref.current?.present();
      }
    }
  }, [t]);

  const count = useRef(0);

  useHotkeys(["shift+tab", "tab"], () => {
    count.current += 1;
    if (count.current > 5) {
      show();
      count.current = 0;
    }
  });

  const handleDismiss = () => {
    AsyncStorage.setItem("closedTabFriendPrompt", "true");
    ref.current?.close();
  };

  return (
    <Modal
      sheetRef={ref}
      animation="SCALE"
      maxWidth={370}
      onClose={handleDismiss}
    >
      <View style={{ padding: 20, alignItems: "center" }}>
        <Emoji emoji="2328" size={50} style={{ marginTop: 10 }} />
        <Text
          style={{
            textAlign: "center",
            fontSize: 40,
            fontFamily: "serifText800",
            marginVertical: 10,
          }}
        >
          Hey there, tab friend!
        </Text>
        <Text
          style={{ textAlign: "center", opacity: 0.6, fontSize: 20 }}
          weight={300}
        >
          We've built some keyboard shortcuts to help you navigate faster. Want
          to learn more?
        </Text>
        <View style={{ width: "100%", gap: 5, marginTop: 20 }}>
          <Button
            onPress={() => {
              handleDismiss();
              router.push("/settings/shortcuts");
            }}
            variant="filled"
            large
            bold
            height={60}
            text="Take me there!"
          />
          <Button
            onPress={handleDismiss}
            variant="outlined"
            large
            height={60}
            text="Not right now"
          />
        </View>
      </View>
    </Modal>
  );
}

