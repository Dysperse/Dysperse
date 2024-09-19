import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { Button, ButtonText } from "@/ui/Button";
import Divider from "@/ui/Divider";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Modal from "@/ui/Modal";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha, useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { memo, useRef } from "react";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const TimeZoneModal = () => {
  const theme = useColorTheme();
  const { session } = useUser();

  const ref = useRef(null);

  return (
    <>
      <Button
        backgroundColors={{
          default: addHslAlpha(theme[2], 0),
          hovered: addHslAlpha(theme[2], 0.2),
          pressed: addHslAlpha(theme[2], 0.3),
        }}
        height={30}
        onPress={() => ref.current.present()}
      >
        <Icon style={{ color: theme[2] }} bold size={18}>
          travel
        </Icon>
        <Text style={{ color: theme[2], fontSize: 12 }} weight={900}>
          Travel mode on
        </Text>
        <Icon style={{ color: theme[2], marginLeft: -10 }} size={18}>
          expand_more
        </Icon>
      </Button>
      <Modal animation="SCALE" sheetRef={ref} maxWidth={380}>
        <View style={{ padding: 20, alignItems: "center" }}>
          <Emoji emoji="1F9ED" size={50} />
          <Text
            style={{
              textAlign: "center",
              fontSize: 40,
              fontFamily: "serifText800",
              marginBottom: 10,
              marginTop: 20,
            }}
          >
            Hey there,{"\n"} time traveller.
          </Text>
          <Text
            style={{ textAlign: "center", opacity: 0.6, fontSize: 20 }}
            weight={300}
          >
            It looks like you're outside of {"\n"}your usual timezone.
          </Text>

          <Text
            variant="eyebrow"
            style={{ textAlign: "center", marginTop: 20 }}
          >
            Times shown in app will reflect...
          </Text>
          <View style={{ gap: 5, marginTop: 7, width: "100%" }}>
            <ListItemButton
              variant="filled"
              onPress={() => {
                if (process.env.NODE_ENV === "development")
                  return alert(dayjs.tz().format("dddd, MMMM D, YYYY h:mm A"));
                Toast.show({ type: "info", text1: "Coming soon!" });
              }}
            >
              <ListItemText
                primary={dayjs.tz.guess()}
                secondary="Your current time zone"
              />
              <Icon>check</Icon>
            </ListItemButton>
            <ListItemButton
              onPress={() => {
                if (process.env.NODE_ENV === "development")
                  return dayjs.tz.setDefault(session?.user?.timeZone);
                Toast.show({ type: "info", text1: "Coming soon!" });
              }}
            >
              <ListItemText
                primary={session?.user?.timeZone}
                secondary="Your usual time zone"
              />
            </ListItemButton>
          </View>

          <Divider style={{ marginTop: 10, marginBottom: 5 }} />

          <Button
            onPress={() => Toast.show({ type: "info", text1: "Coming soon!" })}
          >
            <ButtonText>Make {dayjs.tz.guess()} my default</ButtonText>
          </Button>
        </View>
      </Modal>
    </>
  );
};

const LoadingErrors = memo(() => {
  const red = useColor("red");
  const theme = useColorTheme();
  const { error, session } = useUser();
  const { error: storageError } = useStorageContext();
  const insets = useSafeAreaInsets();

  const isTimeZoneDifference = session?.user?.timeZone !== dayjs.tz.guess();

  return (
    <>
      {(error || storageError || isTimeZoneDifference) && (
        <View
          style={[
            {
              backgroundColor: theme[11],
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 40 + insets.top,
              marginBottom: -insets.top,
              paddingTop: insets.top,
              zIndex: 999,
              gap: 20,
            },
          ]}
        >
          <StatusBar barStyle="dark-content" />
          {(error || storageError) && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Spinner size={18} color={red[2]} />
              <Text
                style={{ color: red[2], fontSize: 12, marginBottom: -1 }}
                weight={700}
              >
                {error
                  ? error.message === "Failed to fetch"
                    ? "You're offline"
                    : "Offline"
                  : "Offline"}
              </Text>
            </View>
          )}
          {isTimeZoneDifference && <TimeZoneModal />}
        </View>
      )}
    </>
  );
});

export default LoadingErrors;

