import Content from "@/components/layout/content";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { useCallback } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

export default function Page() {
  const theme = useColorTheme();
  const { session, mutate, sessionToken } = useUser();

  const { data, error } = useSWR("releases", {
    fetcher: () =>
      fetch(
        `https://api.github.com/repos/dysperse/API/releases?per_page=1`
      ).then((res) => res.json()),
  });

  const handleDone = useCallback(() => {
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

  return (
    <Content>
      <ScrollView
        contentContainerStyle={{
          width: "100%",
          maxWidth: 400,
          paddingHorizontal: 20,
          marginHorizontal: "auto",
        }}
      >
        <View
          style={{
            alignItems: "center",
            marginBottom: 40,
            borderBottomWidth: 2,
            gap: 20,
            borderBottomColor: theme[3],
            paddingVertical: 50,
          }}
        >
          <Logo size={60} />
          <Text
            style={{
              fontSize: 35,
              fontFamily: "serifText800",
              textAlign: "center",
              color: theme[11],
            }}
          >
            what's cooking{"\n"}@ dysperse
          </Text>
          <Text style={{ fontSize: 15, color: theme[11], opacity: 0.5 }}>
            {data?.[0]?.name} &bull; {dayjs(data?.[0]?.published_at).fromNow()}
          </Text>
          <Button
            icon="done"
            text="Mark as read"
            variant="filled"
            large
            bold
            containerStyle={{ width: "100%", marginBottom: -20 }}
            onPress={handleDone}
          />
        </View>
        <MarkdownRenderer>
          {data?.[0]?.body?.split("<!--dysperse-changelog-end-->")?.[0] || ""}
        </MarkdownRenderer>
      </ScrollView>
    </Content>
  );
}
