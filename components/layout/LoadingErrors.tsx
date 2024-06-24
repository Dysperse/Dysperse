import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { memo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LoadingErrors = memo(() => {
  const red = useColor("red");
  const theme = useColorTheme();
  const orange = useColor("orange");
  const { error, isValidating } = useUser();
  const { error: storageError, isStorageValidating } = useStorageContext();
  const insets = useSafeAreaInsets();

  return (
    (error || storageError) && (
      <View
        style={[
          {
            backgroundColor: theme[11],
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 30 + insets.top,
            marginBottom: -insets.top,
            paddingTop: insets.top,
            zIndex: 999,
            gap: 10,
          },
          (isValidating || isStorageValidating) && {
            backgroundColor: orange[11],
          },
        ]}
      >
        <Icon style={{ color: red[2] }} bold size={18}>
          cloud_off
        </Icon>
        <Text
          style={{ color: red[2], fontSize: 12, marginBottom: -1 }}
          weight={700}
        >
          {isValidating || isStorageValidating
            ? "Reconnecting…"
            : error
            ? error.message === "Failed to fetch"
              ? "You're offline"
              : "Can't connect to Dysperse"
            : "Can't load storage data"}
        </Text>
      </View>
    )
  );
});

export default LoadingErrors;
