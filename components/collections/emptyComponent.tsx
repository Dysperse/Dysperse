import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
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
import React, { useMemo, useRef } from "react";
import { Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { useCollectionContext } from "./context";

function InspireMe({ row, labelId }) {
  const { data: collection } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();
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
        variant={breakpoints.md ? "filled" : "text"}
        dense
        containerStyle={{
          marginRight: "auto",
          marginTop: 10,
          marginLeft: row ? 80 : "auto",
          zIndex: 99,
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

      <Modal sheetRef={ref} animation="SCALE" height={500}>
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

const messages = [
  ["bedtime", "Shhh!", "It's quiet here!"],
  ["celebration", "Enjoy the calm!", "Take a breather"],
  ["psychiatry", "Pause and relax!", "No plans, no worries"],
  ["electric_bolt", "Energize yourself", "Maybe get some sleep?"],
  ["cheer", "Peaceful moment!", "Savor the tranquility"],
  ["bedtime", "It's quiet here", "Quick stretch or snack?"],
  ["cheer", "Crushing it!", "No task is too big"],
  ["celebration", "Look at yourself", "You're beautiful."],
];

export const ColumnEmptyComponent = function ColumnEmptyComponent({
  row,
  list,
  showInspireMe,
  labelId,
  finished,
}: {
  row?: boolean;
  list?: boolean;
  showInspireMe?: boolean;
  labelId?: string;
  finished?: boolean;
}) {
  const { session } = useUser();
  const theme = useColorTheme();

  const message = useMemo(
    () => messages[Math.floor(Math.random() * messages.length)],
    []
  );

  return (
    <View
      style={[
        finished && {
          marginTop: 5,
          paddingTop: 60,
          marginBottom: 10,
          paddingBottom: 20,
          borderRadius: 20,
          backgroundColor: theme[3],
        },
      ]}
    >
      <View
        style={[
          {
            gap: list || row ? 20 : 10,
            paddingHorizontal: 20,
            paddingTop: Platform.OS === "android" ? 70 : undefined,
          },
          row && { flexDirection: "row", alignItems: "center" },
          list && { paddingVertical: 70 },
          !list && { marginTop: -40 },
        ]}
      >
        <Icon size={40} style={!row && { marginHorizontal: "auto" }}>
          {message[0]}
        </Icon>
        <View style={[{ alignItems: row ? "flex-start" : "center" }]}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "serifText700",
              color: theme[11],
              marginBottom: 5,
            }}
            numberOfLines={1}
          >
            {message[1]}
          </Text>
          <Text
            style={{
              opacity: 0.6,
              zIndex: 99,
              color: theme[11],
              marginTop: -3,
            }}
            numberOfLines={1}
          >
            {message[2]}
          </Text>
        </View>
      </View>
      {session?.user?.betaTester && showInspireMe && labelId && (
        <InspireMe row={row} labelId={labelId} />
      )}
    </View>
  );
};

