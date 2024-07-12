import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text, { getFontName } from "@/ui/Text";
import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Portal } from "@gorhom/portal";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { memo, useCallback, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Markdown from "react-native-markdown-display";
import useSWR from "swr";

const ReleaseModal = memo(() => {
  const { session, mutate, sessionToken } = useUser();
  const theme = useColorTheme();
  const isDark = useDarkMode();

  const { data, error } = useSWR("releases", {
    fetcher: () =>
      fetch(
        `https://api.github.com/repos/dysperse/API/releases?per_page=1`
      ).then((res) => res.json()),
  });

  const handleDone = useCallback(() => {
    setOpen(false);
    mutate(
      (d) => {
        return {
          ...d,
          user: { ...d.user, lastReleaseVersionViewed: data?.[0]?.id },
        };
      },
      {
        revalidate: false,
      }
    );
    sendApiRequest(
      sessionToken,
      "PUT",
      "user/account",
      {},
      { body: JSON.stringify({ lastReleaseVersionViewed: data?.[0]?.id }) }
    );
  }, [data, mutate, sessionToken]);

  const updateExists =
    !error &&
    data &&
    data?.[0]?.id &&
    session?.user?.lastReleaseVersionViewed !== data?.[0]?.id;

  const [open, setOpen] = useState(false);
  const breakpoints = useResponsiveBreakpoints();
  return (
    <>
      {(updateExists || true) && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            padding: 25,
            marginTop: breakpoints.md ? 0 : 70,
          }}
        >
          <Pressable
            onPress={() => setOpen(true)}
            style={({ pressed, hovered }) => ({
              padding: 10,
              paddingVertical: 5,
              borderRadius: 99,
              gap: 10,
              alignItems: "center",
              backgroundColor: theme[pressed ? 12 : hovered ? 11 : 10],
              flexDirection: "row",
            })}
          >
            <Icon style={{ color: theme[2] }}>celebration</Icon>
            <Text style={{ color: theme[2] }} weight={600}>
              Dysperse has been updated!
            </Text>
            <Icon style={{ color: theme[2] }}>east</Icon>
          </Pressable>
        </View>
      )}
      {open && (
        <Portal>
          <BlurView
            tint={
              isDark
                ? "systemUltraThinMaterialDark"
                : "systemUltraThinMaterialLight"
            }
            intensity={50}
            style={[
              {
                zIndex: 99,
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                alignItems: "center",
                justifyContent: "center",
              },
              Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
            ]}
          >
            <Button
              icon="done"
              text="Got it!"
              variant="filled"
              large
              containerStyle={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 99,
              }}
              onPress={handleDone}
            />
            <ScrollView
              style={{
                width: "100%",
                padding: 20,
                maxWidth: 700,
                paddingVertical: 100,
              }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={{ fontSize: 50, color: theme[11] }} weight={900}>
                What's new!?
              </Text>
              <Text
                style={{ fontSize: 33, color: theme[11], opacity: 0.6 }}
                weight={500}
              >
                {data?.[0]?.name} &bull;{" "}
                {dayjs(data?.[0]?.published_at).fromNow()}
              </Text>
              <Markdown
                style={{
                  body: {
                    color: theme[11],
                    fontFamily: getFontName("jost", 400),
                    fontSize: 15,
                  },
                  heading1: {
                    fontFamily: getFontName("jost", 800),
                    fontSize: 30,
                  },
                  heading2: {
                    fontFamily: getFontName("jost", 800),
                    fontSize: 27,
                  },
                  heading3: {
                    fontFamily: getFontName("jost", 800),
                    marginTop: 20,
                    fontSize: 24,
                  },
                }}
              >
                {data?.[0]?.body?.split("<!--dysperse-changelog-end-->")?.[0] ||
                  ""}
              </Markdown>
            </ScrollView>
          </BlurView>
        </Portal>
      )}
    </>
  );
});

export default ReleaseModal;
