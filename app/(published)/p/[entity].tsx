import { TaskImportantChip, TaskLabelChip } from "@/components/task";
import { TaskDrawerContent } from "@/components/task/drawer/content";
import { TaskDrawerContext } from "@/components/task/drawer/context";
import {
  handleLocationPress,
  isValidHttpUrl,
} from "@/components/task/drawer/details";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Logo from "@/ui/logo";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { createContext, useCallback, useContext, useMemo } from "react";
import { Linking, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import useSWR from "swr";

const PublishedEntityContext = createContext(null);
const usePublishedEntityContext = () => useContext(PublishedEntityContext);

const Header = () => {
  const theme = useColor("mint");
  const params = useLocalSearchParams();

  const handleShare = useCallback(() => {
    Sharing.shareAsync(`https://dys.us.to/${params.entity}`);
  }, [params]);

  return (
    <View
      style={{
        height: 100,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Pressable
        onPress={() => Linking.openURL("https://dysperse.com")}
        style={{
          alignItems: "center",
          gap: 10,
          flexDirection: "row",
        }}
      >
        <Logo size={50} color="mint" />
        <Text
          style={{
            fontSize: 20,
            color: theme[11],
          }}
          weight={900}
        >
          #dysperse
        </Text>
        <Icon>north_east</Icon>
      </Pressable>
      <IconButton
        icon="ios_share"
        size={50}
        variant="outlined"
        onPress={handleShare}
      />
    </View>
  );
};

const ErrorPage = () => {
  const theme = useColor("mint");
  const breakpoints = useResponsiveBreakpoints();

  return (
    <ColorThemeProvider setHTMLAttributes theme={theme}>
      <View
        style={{
          backgroundColor: theme[1],
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Header />
        <Alert
          direction={breakpoints.md ? "row" : "column"}
          emoji="1f494"
          title="This link might be broken, or you may not have access…"
          subtitle="We searched the whole galaxy but couldn't find the item you're looking for."
        />
      </View>
    </ColorThemeProvider>
  );
};

const TaskChips = () => {
  const theme = useColorTheme();
  const { data } = usePublishedEntityContext();

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <Button
        chip
        large
        text="Public"
        style={{ backgroundColor: theme[4] }}
        icon="public"
      />
      {data.pinned && <TaskImportantChip published large />}
      {data.label && <TaskLabelChip large published task={data} />}
    </View>
  );
};

const TaskAttachmentCard = ({ item }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  let icon = "";
  let name = item.data;

  switch (item.type) {
    case "LINK":
      icon = "link";
      if (isValidHttpUrl(name)) name = new URL(item.data).hostname;
      break;
    case "LOCATION":
      if (name.rich) {
        name = name.name;
      }
      icon = isValidHttpUrl(item.data) ? "link" : "map";
      if (isValidHttpUrl(name)) name = new URL(item.data).hostname;
      break;
    case "IMAGE":
      icon = "image";
      break;
  }

  const handleOpenPress = useCallback(() => {
    if (item.type === "LOCATION") {
      handleLocationPress(undefined, {
        type: "LOCATION",
        data: item.data,
      });
    }
    if (isValidHttpUrl(item.data)) {
      Linking.openURL(item.data);
    } else {
      Linking.openURL(`https://maps.google.com/?q=${item.data}`);
    }
  }, [item.data, handleLocationPress]);

  return (
    <Pressable
      onPress={handleOpenPress}
      style={({ pressed, hovered }) => ({
        backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        padding: 20,
        borderRadius: 20,
        ...(breakpoints.md
          ? { flex: 1, maxWidth: "33.33333%" }
          : { width: "100%" }),
        gap: 5,
      })}
    >
      <Avatar
        icon={icon}
        theme="mint"
        size={40}
        style={{
          backgroundColor: addHslAlpha(theme[7], 0.3),
        }}
      />
      <View style={{ paddingHorizontal: 5 }}>
        <Text weight={700} style={{ fontSize: 20 }} numberOfLines={1}>
          {item.name || name}
        </Text>
        <View
          style={{
            opacity: 0.7,
            gap: 5,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text>
            Open{" "}
            {item.type === "IMAGE"
              ? "image"
              : isValidHttpUrl(item.data)
              ? "link"
              : "in Maps"}
          </Text>
          <Icon>north_east</Icon>
        </View>
      </View>
    </Pressable>
  );
};

export default function Page() {
  const theme = useColor("mint");
  const params = useLocalSearchParams();
  const { data, isLoading, error } = useSWR([
    "published",
    { id: params.entity, user: "true" },
  ]);

  const contextValue = useMemo(() => ({ data }), [data]);
  if (!params.entity || error) return <ErrorPage />;

  return (
    <PublishedEntityContext.Provider value={contextValue}>
      <ColorThemeProvider setHTMLAttributes theme={theme}>
        {!isLoading && !data?.name ? (
          <ErrorPage />
        ) : (
          <BottomSheetModalProvider>
            <MenuProvider>
              <ScrollView
                style={{
                  backgroundColor: theme[1],
                  height: 100,
                }}
                contentContainerStyle={{
                  alignItems: "center",
                  paddingBottom: 50,
                  paddingHorizontal: 20,
                }}
              >
                <Header />
                {!data?.name ? (
                  <Spinner />
                ) : (
                  <>
                    <View
                      style={{
                        width: 500,
                        maxWidth: "100%",
                        backgroundColor: theme[3],
                        borderRadius: 20,
                        marginBottom: 10,
                        padding: 20,
                        paddingTop: 21,
                        overflow: "hidden",
                      }}
                    >
                      <Text style={{ textAlign: "center" }}>
                        You're viewing a task shared by{"  "}
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 5,
                            transform: [{ translateY: -1 }],
                          }}
                        >
                          {data.space.members?.[0]?.user?.profile?.name && (
                            <ProfilePicture
                              size={24}
                              image={
                                data.space.members?.[0]?.user?.profile?.picture
                              }
                              name={
                                data.space.members?.[0]?.user?.profile?.name
                              }
                            />
                          )}
                          <Text weight={700}>
                            {data.space.members?.[0]?.user?.profile?.name ||
                              "an anonymous Dysperse user"}
                          </Text>
                        </View>
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 500,
                        maxWidth: "100%",
                        backgroundColor: theme[2],
                        borderRadius: 20,
                        borderWidth: 1,
                        overflow: "hidden",
                        borderColor: theme[5],
                      }}
                    >
                      <TaskDrawerContext.Provider
                        value={{
                          dateRange: null,
                          task: data,
                          updateTask: () => {},
                          mutateList: () => {},
                          isReadOnly: true,
                        }}
                      >
                        <TaskDrawerContent handleClose={() => {}} />
                      </TaskDrawerContext.Provider>
                    </View>
                  </>
                )}
              </ScrollView>
            </MenuProvider>
          </BottomSheetModalProvider>
        )}
      </ColorThemeProvider>
    </PublishedEntityContext.Provider>
  );
}

