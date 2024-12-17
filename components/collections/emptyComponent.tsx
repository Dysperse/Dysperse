import { useUser } from "@/context/useUser";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Modal from "@/ui/Modal";
import ModalHeader from "@/ui/ModalHeader";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import * as shapes from "@/ui/shapes";
import React, { useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";

function InspireMe() {
  const ref = useRef(null);

  return (
    <>
      <Button
        containerStyle={{ opacity: 0.6, marginTop: 15, zIndex: 9999 }}
        text="Inspire me"
        icon="magic_button"
        onPress={() => ref.current.present()}
      />

      <Modal sheetRef={ref} animation="SCALE">
        <ModalHeader title="AI inspiration" />
        <View style={{ padding: 20, paddingTop: 0 }}>
          <Spinner />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
  },
  emptyIcon: { transform: [{ rotate: "-45deg" }] },
  emptyIconContainer: {
    borderRadius: 30,
    marginBottom: 20,
    transform: [{ rotate: "45deg" }],
  },
});

const shapesLength = Array.from({ length: 7 }, (_, i) => `shape${i + 1}`);

const messages = [
  ["1f92b", "Shhh!", "It's quiet here!"],
  ["1f60a", "Enjoy the calm!", "Take a breather"],
  ["1f92b", "Silence is golden!", "Embrace the quiet"],
  ["1f60c", "Pause and relax!", "No plans, no worries"],
  ["1fab4", "Positive vibes", "Idea: Free time?"],
  ["1f4ab", "Energize yourself", "Maybe get some sleep?"],
  ["1fae0", "Peaceful moment!", "Savor the tranquility"],
  ["26c5", "Own your day!", "Effort = Results"],
  ["1f44a", "You're unstoppable!", "Quick stretch or snack"],
  ["1f5ff", "Crushing it!", "No task is too big"],
  ["1f985", "Look at yourself", "You're beautiful."],
];

export const ColumnEmptyComponent = function ColumnEmptyComponent({
  row,
  dense,
  list,
}: {
  row?: boolean;
  dense?: boolean;
  list?: boolean;
}) {
  const theme = useColorTheme();
  const { session } = useUser();

  const message = useMemo(
    () => messages[Math.floor(Math.random() * messages.length)],
    []
  );

  const Shape = useMemo(
    () => shapes[shapesLength[Math.floor(Math.random() * shapesLength.length)]],
    []
  );

  return (
    <View
      style={[
        styles.empty,
        {
          // pointerEvents: "none",
          paddingTop: Platform.OS === "android" ? 70 : undefined,
        },
        row && { flexDirection: "row", alignItems: "center", gap: 20 },
        list && { paddingVertical: 70 },
      ]}
    >
      <View
        style={{
          paddingHorizontal: 20,
          position: "relative",
          marginBottom: 20,
        }}
      >
        <Shape color={theme[5]} size={100} />
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <Emoji emoji={message[0]} size={50} />
        </View>
      </View>
      <View
        style={[row ? { marginTop: -30, flex: 1 } : { alignItems: "center" }]}
      >
        <Text
          weight={dense ? 900 : 300}
          style={{ fontSize: dense ? 20 : 30 }}
          numberOfLines={1}
        >
          {message[1]}
        </Text>
        <Text style={{ opacity: 0.6 }} numberOfLines={1}>
          {message[2]}
        </Text>

        {session.user.betaTester && <InspireMe />}
      </View>
    </View>
  );
};
