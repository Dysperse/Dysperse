import Content from "@/components/layout/content";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import MenuIcon from "@/components/menuIcon";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import Logo from "@/ui/logo";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { useCallback } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

export const MenuButton = () => {
  const { sidebarRef } = useSidebarContext();

  return (
    <IconButton
      icon={<MenuIcon />}
      size={55}
      variant="outlined"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 100,
        margin: 20,
      }}
      onPress={() => sidebarRef.current.openDrawer()}
    />
  );
};

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { session, mutate, sessionToken } = useUser();
  const { desktopCollapsed } = useSidebarContext();

  const { data, error } = useSWR("releases", {
    fetcher: () =>
      fetch(
        `https://api.github.com/repos/dysperse/API/releases?per_page=1`
      ).then((res) => res.json()),
  });

  const updateExists =
    !error &&
    data &&
    data?.[0]?.id &&
    session?.user?.lastReleaseVersionViewed !== data?.[0]?.id;

  const handleDone = useCallback(() => {
    mutate(
      (d) => {
        return {
          ...d,
          user: {
            ...d.user,
            lastReleaseVersionViewed: !updateExists ? 0 : data?.[0]?.id,
          },
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
      {
        body: JSON.stringify({
          lastReleaseVersionViewed: !updateExists ? -1 : data?.[0]?.id,
        }),
      }
    );
  }, [data, mutate, sessionToken, updateExists]);

  return (
    <Content noPaddingTop>
      {!(breakpoints.md || desktopCollapsed) && <MenuButton />}
      <ScrollView
        contentContainerStyle={{
          width: "100%",
          maxWidth: 400,
          paddingHorizontal: 20,
          paddingTop: breakpoints.md ? 20 : 100,
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
            icon={!updateExists ? "mark_email_unread" : "email"}
            text={`Mark as ${updateExists ? "read" : "unread"}`}
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

