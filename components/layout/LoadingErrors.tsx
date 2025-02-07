import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { memo } from "react";
import { View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LoadingErrors = memo(() => {
  const theme = useColorTheme();
  const { error } = useUser();
  const { error: storageError } = useStorageContext();
  const insets = useSafeAreaInsets();

  return (
    <>
      {(error || storageError) && (
        <View
          style={[
            {
              backgroundColor: theme[6],
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
          <SystemBars style="dark" />
          {(error || storageError) && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Spinner size={18} />
              <Text style={{ fontSize: 12, marginBottom: -1 }} weight={700}>
                {error
                  ? error.message === "Failed to fetch"
                    ? "You're offline"
                    : "Offline"
                  : "Offline"}
              </Text>
            </View>
          )}
        </View>
      )}
    </>
  );
});

export default LoadingErrors;
