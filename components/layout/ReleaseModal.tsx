import { useUser } from "@/context/useUser";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import { router } from "expo-router";
import { memo } from "react";
import { Platform, View } from "react-native";
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
            marginBottom: 20,
            ...(Platform.OS === "web" &&
              ({ WebkitAppRegion: "no-drag" } as any)),
          }}
        >
          <Button
            onPress={() => router.push("/release")}
            variant="filled"
            large
            bold
            style={{ paddingHorizontal: 10 }}
          >
            <Icon>celebration</Icon>
            <View style={{ flex: 1 }}>
              <ButtonText
                weight={700}
                numberOfLines={2}
                style={{ fontSize: 12 }}
              >
                New update ready!
              </ButtonText>
              <ButtonText style={{ fontSize: 12 }} weight={400}>
                Tap to see what's new
              </ButtonText>
            </View>
          </Button>
        </View>
      )}
    </>
  );
});

export default ReleaseModal;

