import { Avatar, ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import React, { cloneElement, useCallback, useRef } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useTaskDrawerContext } from "./context";

const timelineStyles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    paddingLeft: 10,
    gap: 15,
  },
  dot: {
    borderWidth: 4,
    borderRadius: 99,
    width: 36,
    height: 36,
    marginLeft: -30,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: { flexDirection: "row", gap: 18 },
});

export function TaskStream({ children }: { children: React.ReactElement }) {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const ref = useRef<BottomSheetModal>(null);
  const { task } = useTaskDrawerContext();

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        snapPoints={width > 600 ? ["90%"] : ["80%", "90%"]}
        onClose={handleClose}
        style={{
          maxWidth: 550,
          margin: "auto",
        }}
        stackBehavior="push"
      >
        <BottomSheetScrollView contentContainerStyle={{ padding: 20 }}>
          <View
            style={{
              paddingTop: 10,
              flexDirection: "row",
              gap: 10,
              width: "100%",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <IconButton
              onPress={handleClose}
              style={{ backgroundColor: theme[3] }}
            >
              <Icon>arrow_back_ios_new</Icon>
            </IconButton>
            <Text style={{ fontSize: 20 }} weight={700}>
              Audit log
            </Text>
          </View>
          <View
            style={{
              paddingLeft: 20,
              paddingTop: 15,
            }}
          >
            <View
              style={[
                timelineStyles.container,
                {
                  borderLeftColor: theme[5],
                },
              ]}
            >
              {task ? (
                task.history.map((audit) => (
                  <View key={audit.id} style={timelineStyles.itemContainer}>
                    <View
                      style={[
                        timelineStyles.dot,
                        {
                          borderColor: theme[1],
                          width: 30,
                          height: 30,
                          position: "relative",
                        },
                      ]}
                    >
                      <ProfilePicture
                        size={30}
                        name={audit.who.profile.name}
                        image={audit.who.profile.picture}
                        style={{
                          borderWidth: 2,
                          borderColor: theme[1],
                        }}
                      />
                      <Avatar
                        size={23}
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          borderWidth: 2,
                          borderColor: theme[1],
                        }}
                      >
                        <Icon
                          style={{ marginTop: -6, marginLeft: -3 }}
                          size={24}
                        >
                          {audit.type === "CREATE"
                            ? "add"
                            : audit.type == "POSTPONE"
                            ? "east"
                            : "edit"}
                        </Icon>
                      </Avatar>
                    </View>
                    <View style={{ flex: 1, paddingTop: 5, paddingBottom: 10 }}>
                      <Text variant="eyebrow">{audit.who.profile.name}</Text>
                      <Text style={{ fontSize: 25 }} weight={700}>
                        {audit.data.replace(" a ", " this ")}
                      </Text>
                      <Text style={{ opacity: 0.6 }}>
                        {dayjs(audit.timestamp).format("MMM Do h:mm A")} &bull;{" "}
                        {dayjs(audit.timestamp).fromNow()}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Spinner />
              )}
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}
