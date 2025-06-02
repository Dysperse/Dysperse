import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Logo from "@/ui/logo";
import Modal from "@/ui/Modal";
import ModalContent from "@/ui/Modal/content";
import ModalHeader from "@/ui/ModalHeader";
import SkeletonContainer from "@/ui/Skeleton/container";
import { LinearSkeletonArray } from "@/ui/Skeleton/linear";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { shareAsync } from "expo-sharing";
import React, { useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import useSWR from "swr";
import Streaks from "../home/streaks";
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

function ShareProgress() {
  const theme = useColorTheme();
  const ref = useRef(null);
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState("LARGE");
  const [capture, setCapture] = useState(false);

  const shotRef = useRef(null);

  const handleCapture = () => {
    setCapture(true);

    setTimeout(() => {
      shotRef.current?.capture().then((uri) => {
        shareAsync(uri, {
          dialogTitle: "Share your insights",
          mimeType: "image/png",
          UTI: "public.png",
        });
        setCapture(false);
      });
    }, 10);
  };

  return (
    <>
      <Button
        dense
        icon="ios_share"
        text="Share"
        variant="filled"
        onPress={() => ref.current.present()}
        backgroundColors={{
          default: theme[4],
          hovered: theme[5],
          pressed: theme[6],
        }}
      />
      <BottomSheet sheetRef={ref} snapPoints={[size === "SMALL" ? 470 : 680]}>
        <View style={{ height: "100%" }}>
          <ModalHeader title="Share" noPaddingTop subtitle="Coming soon!" />
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              opacity: capture ? 0 : 1,
            }}
          >
            <ViewShot
              ref={shotRef}
              options={{
                fileName: "My Dysperse Insights",
                format: "png",
                quality: 1,
              }}
            >
              <View
                style={[
                  {
                    aspectRatio: size === "SMALL" ? "5 / 4" : "9 / 16",
                    width: 220,
                    backgroundColor: theme[3],
                    padding: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  (size === "SMALL" || !capture) && {
                    borderWidth: 1,
                    borderRadius: 10,
                    borderColor: theme[6],
                  },
                  !capture && {
                    shadowColor: theme[9],
                    shadowRadius: 20,
                    shadowOffset: { height: 10, width: 10 },
                    shadowOpacity: 0.2,
                  },
                ]}
              >
                {size === "SMALL" ? (
                  <Logo size={30} />
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      paddingTop: 20,
                      marginBottom: "auto",
                      width: "100%",
                    }}
                  >
                    <Logo size={24} />
                    <Text
                      style={{ color: theme[11], fontSize: 12 }}
                      weight={800}
                    >
                      #dysperse
                    </Text>
                  </View>
                )}
                {size === "LARGE" && <View style={{ flex: 1 }} />}
                <Text
                  style={{
                    fontFamily: "serifText700",
                    fontSize: size === "SMALL" ? 20 : 25,
                    marginTop: 10,
                    marginBottom: 5,
                    textAlign: "center",
                    color: theme[11],
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  I completed{"\n"}
                  <View
                    style={{
                      backgroundColor: theme[9],
                      verticalAlign: "middle",
                      borderRadius: 5,
                      paddingHorizontal: 4,
                      marginBottom: -3,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "serifText700",
                        fontSize: size === "SMALL" ? 20 : 25,
                        color: theme[2],
                      }}
                    >
                      7 tasks
                    </Text>
                  </View>{" "}
                  today
                </Text>
                {size === "LARGE" && <Streaks dense />}
                <View style={{ flexDirection: "row", gap: 5 }}>
                  <Button
                    chip
                    text={dayjs().format("MMMM Do")}
                    backgroundColors={
                      {
                        default: theme[4],
                      } as any
                    }
                    height={size === "SMALL" ? undefined : 25}
                    style={{
                      paddingHorizontal: size === "SMALL" ? 13 : 12,
                    }}
                    containerStyle={{
                      marginTop: 5,
                      borderRadius: 10,
                    }}
                    textStyle={{ fontSize: 10 }}
                    iconSize={20}
                    disabled
                  />
                  <Button
                    chip
                    text="7"
                    icon="local_fire_department"
                    backgroundColors={
                      {
                        default: theme[4],
                      } as any
                    }
                    iconStyle={{ marginTop: -3 }}
                    height={size === "SMALL" ? undefined : 25}
                    style={{
                      paddingRight: size === "SMALL" ? 13 : 12,
                      paddingLeft: size === "SMALL" ? undefined : 7,
                    }}
                    textStyle={{ fontSize: 10 }}
                    iconSize={20}
                    containerStyle={{
                      marginTop: 5,
                      borderRadius: 10,
                    }}
                    disabled
                  />
                </View>

                {size === "LARGE" && <View style={{ flex: 1 }} />}
              </View>
            </ViewShot>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <Button
              text="Small"
              backgroundColors={{
                default: theme[size === "SMALL" ? 4 : 2],
                hovered: theme[5],
                pressed: theme[6],
              }}
              onPress={() => {
                setSize("SMALL");
                impactAsync(ImpactFeedbackStyle.Medium);
              }}
            />
            <Button
              text="Large"
              backgroundColors={{
                default: theme[size === "LARGE" ? 4 : 2],
                hovered: theme[5],
                pressed: theme[6],
              }}
              onPress={() => {
                setSize("LARGE");
                impactAsync(ImpactFeedbackStyle.Medium);
              }}
            />
          </View>
          <View style={{ padding: 20, paddingBottom: 10 + insets.bottom }}>
            <Button
              text="Share"
              icon="ios_share"
              onPress={handleCapture}
              large
              bold
              variant="filled"
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

export const ColumnEmptyComponent = function ColumnEmptyComponent({
  row,
  list,
  showInspireMe,
  labelId,
  finished,
  offset = 0,
  plannerFinished,
}: {
  row?: boolean;
  list?: boolean;
  showInspireMe?: boolean;
  labelId?: string;
  finished?: boolean;
  offset?: number;
  plannerFinished?: boolean;
}) {
  const { session } = useUser();
  const theme = useColorTheme();

  const message = useMemo(() => {
    const hour = (new Date().getHours() + offset) % messages.length;
    const index = hour < 0 ? messages.length + hour : hour;
    return messages[index];
  }, [offset]);

  return (
    <View
      style={[
        finished && {
          marginTop: 5,
          paddingTop: 60,
          marginBottom: 10,
          paddingBottom: 15,
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
            pointerEvents: "none",
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
      <View
        style={{
          flexDirection: "row",
          marginLeft: row ? 80 : "auto",
          gap: 10,
          marginTop: 5,
        }}
      >
        {plannerFinished &&
          (Platform.OS !== "web" || process.env.NODE_ENV == "development") && (
            <ShareProgress />
          )}
        {session?.user?.betaTester && showInspireMe && labelId && (
          <InspireMe row={row} labelId={labelId} />
        )}
      </View>
    </View>
  );
};

