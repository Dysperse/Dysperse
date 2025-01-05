import {
  SubscribeButton,
  useDeviceNotificationState,
} from "@/app/(app)/settings/customization/notifications";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import useSWR from "swr";

export default function NotificationsModal() {
  const t = useDeviceNotificationState();
  const ref = useRef<BottomSheetModal>(null);
  const { data, mutate } = useSWR(["user/notifications"]);

  const show = useCallback(async () => {
    if (t === "prompt") {
      const hasPrompted = await AsyncStorage.getItem(
        "closedNotificationPrompt"
      );
      if (hasPrompted === null) {
        ref.current?.present();
      }
    }
  }, [t]);

  useEffect(() => {
    show();
  }, [show]);

  const handleDismiss = () => {
    AsyncStorage.setItem("closedNotificationPrompt", "true");
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
        <Emoji emoji="1f514" size={50} style={{ marginTop: 10 }} />
        <Text
          style={{
            textAlign: "center",
            fontSize: 30,
            fontFamily: "serifText700",
            marginVertical: 10,
            marginTop: 20,
          }}
        >
          Never miss a beat
        </Text>
        <Text
          style={{
            textAlign: "center",
            opacity: 0.6,
            fontSize: 16,
            paddingHorizontal: 20,
          }}
        >
          Turn on notifications to get reminders about your upcoming events.
        </Text>
        <View style={{ width: "100%", gap: 5, marginTop: 20 }}>
          <SubscribeButton
            onSuccess={handleDismiss}
            text="Sure!"
            data={data}
            disableAutoCheck
            mutate={mutate}
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

