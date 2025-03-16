import { useUser } from "@/context/useUser";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { memo } from "react";
import { Platform, Pressable, View } from "react-native";
import useSWR from "swr";

const ReleaseModal = memo(() => {
  const { session } = useUser();
  const theme = useColorTheme();

  const { data, error } = useSWR("releases", {
    fetcher: () =>
      fetch(
        "https://api.github.com/repos/dysperse/API/releases?per_page=1"
      ).then((res) => res.json()),
  });

  const updateExists =
    !error &&
    data &&
    data?.[0]?.id &&
    session?.user?.lastReleaseVersionViewed !== data?.[0]?.id;

  return (
    <>
      {updateExists && (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99,
            ...(Platform.OS === "web" &&
              ({ WebkitAppRegion: "no-drag" } as any)),
          }}
        >
          <Pressable
            onPress={() => router.push("/release")}
            style={({ pressed, hovered }) => ({
              padding: 10,
              borderRadius: 20,
              gap: 10,
              alignItems: "center",
              backgroundColor: theme[pressed ? 12 : hovered ? 11 : 10],
              flexDirection: "row",
            })}
          >
            <Icon style={{ color: theme[2] }}>celebration</Icon>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme[2], fontSize: 17 }} weight={900}>
                Dysperse was updated!
              </Text>
              <Text style={{ color: theme[2], fontSize: 13 }} weight={500}>
                Tap to see what's new
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    </>
  );
});

export default ReleaseModal;
