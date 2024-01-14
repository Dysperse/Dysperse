import { ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { cloneElement, useCallback, useRef } from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
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
  const theme = useColor(data.profile.theme, useColorScheme() === "dark");

  return data ? (
    <ColorThemeProvider theme={theme}>
      <View style={{ backgroundColor: theme[1], flex: 1 }}>
        <LinearGradient
          colors={[theme[9], theme[5]]}
          style={{
            padding: 30,
            height: 140,
          }}
        >
          <Button
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "transparent",
            }}
          >
            <ButtonText style={{ color: theme[2] }}>Open</ButtonText>
            <Icon style={{ color: theme[2] }}>north_east</Icon>
          </Button>
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
            <View
              style={[
                styles.gridItem,
                {
                  borderColor: theme[6],
                },
              ]}
            >
              <Icon size={40} style={styles.icon}>
                access_time
              </Icon>
              <Text style={styles.gridHeading}>
                {dayjs().tz(data.timeZone).format("hh:mm A") ||
                  "Timezone not set"}
              </Text>
              <Text variant="eyebrow">Local time</Text>
            </View>
            <View
              style={[
                styles.gridItem,
                {
                  borderColor: theme[6],
                },
              ]}
            >
              <Icon size={40} style={styles.icon}>
                kid_star
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
          <Text style={{ fontSize: 20 }}>{data.profile.bio}</Text>
        </View>
      </View>
    </ColorThemeProvider>
  ) : (
    <Text style={{ color: theme[2], fontSize: 20 }}>
      {error ? "Error" : "Loading..."}
    </Text>
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
