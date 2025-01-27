import { useUser } from "@/context/useUser";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Modal from "@/ui/Modal";
import ModalContent from "@/ui/Modal/content";
import ModalHeader from "@/ui/ModalHeader";
import SkeletonContainer from "@/ui/Skeleton/container";
import { LinearSkeletonArray } from "@/ui/Skeleton/linear";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import * as shapes from "@/ui/shapes";
import React, { useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { useCollectionContext } from "./context";

function InspireMe({ labelId }) {
  const { data: collection } = useCollectionContext();
  const ref = useRef(null);
  const [opened, setOpened] = React.useState(false);

  const { data, error } = useSWR(
    !opened
      ? null
      : [
          "ai/task-inspiration",
          {},
          process.env.EXPO_PUBLIC_API_URL,
          {
            method: "POST",
            body: JSON.stringify({ boardId: collection.id, labelId }),
          },
        ],
    {
      revalidateOnFocus: false,
    }
  );

  return (
    <>
      <Button
        containerStyle={{
          opacity: 0.6,
          marginTop: 10,
          marginBottom: -40,
          zIndex: 9999,
        }}
        iconPosition="end"
        text="Inspire me"
        textStyle={{ fontFamily: "body_600" }}
        icon="magic_button"
        onPress={() => {
          setOpened(true);
          ref.current.present();
        }}
      />

      <Modal sheetRef={ref} animation="SCALE">
        <ModalHeader title="AI inspiration" />
        <ModalContent style={{ flex: 1 }}>
          {data ? (
            <View style={{ flex: 1 }}>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {data.map((task) => (
                  <ListItemButton key={task.id}>
                    <Icon>check_circle</Icon>
                    <ListItemText
                      primary={task.name}
                      secondary={task.description}
                    />
                  </ListItemButton>
                ))}
              </ScrollView>
              <Button
                large
                bold
                text="Done"
                icon="done"
                iconPosition="end"
                variant="filled"
              />
            </View>
          ) : error ? (
            <ErrorAlert />
          ) : (
            <SkeletonContainer>
              <LinearSkeletonArray
                animateWidth
                widths={[90, 70, 68, 82, 90, 65, 60, 71, 82, 46, 57]}
                height={46}
              />
            </SkeletonContainer>
          )}
        </ModalContent>
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
  ["1f60c", "Pause and relax!", "No plans, no worries"],
  ["1fab4", "Positive vibes", "Idea: Free time!"],
  ["1f4ab", "Energize yourself", "Maybe get some sleep?"],
  ["1fae0", "Peaceful moment!", "Savor the tranquility"],
  ["1f44a", "It's quiet here", "Quick stretch or snack?"],
  ["1f5ff", "Crushing it!", "No task is too big"],
  ["1f985", "Look at yourself", "You're beautiful."],
];

export const ColumnEmptyComponent = function ColumnEmptyComponent({
  row,
  dense,
  list,
  showInspireMe,
  labelId,
}: {
  row?: boolean;
  dense?: boolean;
  list?: boolean;
  showInspireMe?: boolean;
  labelId?: string;
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
        // row && { flexDirection: "row", alignItems: "center", gap: 20 },
        list && { paddingVertical: 70 },
        row && { marginTop: -40 },
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
      <View style={[{ alignItems: "center" }]}>
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

        {session?.user?.betaTester && showInspireMe && labelId && (
          <InspireMe labelId={labelId} />
        )}
      </View>
    </View>
  );
};

