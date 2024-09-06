import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { memo } from "react";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LoadingErrors = memo(() => {
  const red = useColor("red");
  const theme = useColorTheme();
  const orange = useColor("orange");
  const { error, isValidating, session } = useUser();
  const { error: storageError, isStorageValidating } = useStorageContext();
  const insets = useSafeAreaInsets();

  const isTimeZoneDifference = session?.user?.timeZone === dayjs.tz.guess();

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
            (isValidating || isStorageValidating) &&
              !isTimeZoneDifference && {
                backgroundColor: orange[11],
              },
          ]}
        >
          <StatusBar barStyle="dark-content" />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {isValidating || isStorageValidating ? (
              <Spinner size={18} color={red[2]} />
            ) : (
              <Icon style={{ color: red[2] }} bold size={18}>
                cloud_off
              </Icon>
            )}
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
          {isTimeZoneDifference && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Icon style={{ color: red[2] }} bold size={18}>
                travel
              </Icon>
              <View>
                <Text style={{ color: red[2], fontSize: 12 }} weight={900}>
                  {dayjs.tz.guess()}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </>
  );
});

export default LoadingErrors;

