import { useUser } from "@/context/useUser";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { setStringAsync } from "expo-clipboard";
import { cloneElement, useCallback, useRef } from "react";
import { useWindowDimensions, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

function ProfileModalContent({ email }) {
  const { session } = useUser();
  const { data, error } = useSWR(["user/profile", { email }]);
  const theme = useColor(data?.profile?.theme || "gray");

  return data?.profile ? (
    <ColorThemeProvider theme={theme}>
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        aria-label="Scrollbar-Hidden"
        contentContainerStyle={{ backgroundColor: theme[2] }}
      >
        <View style={{ padding: 35, marginTop: 10, gap: 15 }}>
          <Avatar
            name={data.profile?.name || "--"}
            image={data.profile?.picture}
            size={90}
            style={{ marginHorizontal: "auto" }}
          />
          <Text
            style={{
              fontSize: 35,
              fontFamily: "serifText800",
              marginBottom: -10,
              textAlign: "center",
            }}
          >
            {data.profile.name}
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}
          >
            <Button
              onPress={() => {
                setStringAsync(data.email);
                Toast.show({ type: "success", text1: "Copied to clipboard" });
              }}
              icon="alternate_email"
              chip
              large
              text={data.username || data.email}
            />
          </View>
          <View style={{ gap: 10 }}>
            <ListItemButton variant="filled">
              <Icon>location_on</Icon>
              <ListItemText
                primary={dayjs()
                  .tz(data.timeZone)
                  .format(session.user.militaryTime ? "H:mm" : "h:mm A")}
                secondary="Local time"
              />
            </ListItemButton>
            <ListItemButton variant="filled">
              <Icon>schedule</Icon>
              <ListItemText
                primary={(
                  dayjs(data.profile.lastActive).fromNow() || "Unknown"
                ).replace("a few seconds ago", "Just now")}
                secondary="Last active"
              />
            </ListItemButton>
            <ListItemButton variant="filled">
              <Icon>cake</Icon>
              <ListItemText
                primary={dayjs(data.profile.birthday).format("MMM Do")}
                secondary="Birthday"
              />
            </ListItemButton>
            {data.profile.bio && (
              <ListItemButton variant="filled">
                <Icon>sticky_note_2</Icon>
                <ListItemText primary={data.profile.bio} secondary="About" />
              </ListItemButton>
            )}
          </View>
        </View>

        <View
          style={{ height: 500, marginBottom: -500, backgroundColor: theme[2] }}
        />
      </BottomSheetScrollView>
    </ColorThemeProvider>
  ) : (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        minHeight: 500,
      }}
    >
      {error ? (
        <ErrorAlert />
      ) : (
        <>
          {data ? (
            <View>
              <Text>Profile not found</Text>
            </View>
          ) : (
            <Spinner />
          )}
        </>
      )}
    </View>
  );
}

export function ProfileModal({ children, email, disabled }) {
  const ref = useRef<BottomSheetModal>(null);
  const { height } = useWindowDimensions();
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.forceClose(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  return (
    <>
      {disabled ? children : trigger}
      <BottomSheet
        transformCenter
        sheetRef={ref}
        onClose={handleClose}
        handleComponent={() => null}
        snapPoints={[500]}
        maxWidth={450}
        height={500}
        innerStyles={{ maxHeight: height - 100 }}
        maxBackdropOpacity={0.2}
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        <ProfileModalContent email={email} />
      </BottomSheet>
    </>
  );
}

