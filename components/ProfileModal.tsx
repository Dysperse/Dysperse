import { ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import Chip from "@/ui/Chip";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { cloneElement, useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import useSWR from "swr";

const styles = StyleSheet.create({
  gridItem: {
    flex: 1,
    borderWidth: 2,
    padding: 20,
    borderRadius: 20,
    position: "relative",
    paddingTop: 50,
  },
  icon: { position: "absolute", top: 10, right: 10 },
  gridRow: { flexDirection: "row", marginTop: 20, gap: 20 },
  gridHeading: { fontSize: 30 },
});

function ProfileModalContent({ email }) {
  const { data, error } = useSWR(["user/profile", { email }]);
  const theme = useColor(data?.profile?.theme || "gray");

  return data?.profile ? (
    <ColorThemeProvider theme={theme}>
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        aria-label="Scrollbar-Hidden"
      >
        <View style={{ backgroundColor: theme[1], flex: 1 }}>
          <LinearGradient
            colors={[theme[9], theme[5]]}
            style={{
              padding: 30,
              height: 140,
            }}
          >
            <ProfilePicture
              style={{ top: 80, position: "absolute" }}
              name={data.profile?.name || "--"}
              image={data.profile?.picture}
              size={90}
            />
          </LinearGradient>
          <View style={{ padding: 35, marginTop: 10 }}>
            <Text weight={700} style={{ fontSize: 50 }} heading>
              {data.profile.name}
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Chip
                icon={<Icon>alternate_email</Icon>}
                label={data.username || data.email}
              />
            </View>
            <View style={styles.gridRow}>
              <View style={[styles.gridItem, { borderColor: theme[6] }]}>
                <Icon size={40} style={styles.icon}>
                  access_time
                </Icon>
                <Text style={styles.gridHeading}>
                  {dayjs().tz(data.timeZone).format("hh:mm A") ||
                    "Timezone not set"}
                </Text>
                <Text variant="eyebrow">Local time</Text>
              </View>
              <View style={[styles.gridItem, { borderColor: theme[6] }]}>
                <Icon size={40} style={styles.icon}>
                  magic_button
                </Icon>
                <Text style={styles.gridHeading}>
                  {dayjs(data.profile?.lastActive)
                    .fromNow(true)
                    .split(" ")[0]
                    .replace("a", "1") +
                    dayjs(data.profile?.lastActive)
                      .fromNow(true)
                      .split(" ")?.[1]?.[0]
                      .toUpperCase() || "Timezone not set"}
                </Text>
                <Text variant="eyebrow">Last active</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={[styles.gridItem, { borderColor: theme[6] }]}>
                <Icon size={40} style={styles.icon}>
                  cake
                </Icon>
                <Text style={styles.gridHeading}>
                  {dayjs(data.profile.birthday).format("MMM Do") ||
                    "Timezone not set"}
                </Text>
                <Text variant="eyebrow">Birthday</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={[styles.gridItem, { borderColor: theme[6] }]}>
                <Icon size={40} style={styles.icon}>
                  sticky_note_2
                </Icon>
                <Text style={styles.gridHeading}>{data.profile.bio}</Text>
                <Text variant="eyebrow">About</Text>
              </View>
            </View>
          </View>
        </View>
      </BottomSheetScrollView>
    </ColorThemeProvider>
  ) : (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {error ? (
        <ErrorAlert />
      ) : data ? (
        <View>
          <Text>Profile not found</Text>
        </View>
      ) : (
        <Spinner />
      )}
    </View>
  );
}

export function ProfileModal({ children, email }) {
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={["80%"]}
        handleComponent={() => null}
        maxWidth={500}
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        <ProfileModalContent email={email} />
      </BottomSheet>
    </>
  );
}
