import { TaskDrawerContent } from "@/components/task/drawer/content";
import { TaskDrawerContext } from "@/components/task/drawer/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import { ProfilePicture } from "@/ui/Avatar";
import { useColor } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Logo from "@/ui/logo";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { toastConfig } from "@/ui/toast.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { setStringAsync } from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { shareAsync } from "expo-sharing";
import { createContext, useCallback, useMemo } from "react";
import { Linking, Platform, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const PublishedEntityContext = createContext(null);

const Header = () => {
  const theme = useColor("mint");
  const params = useLocalSearchParams();

  const handleShare = useCallback(() => {
    if (Platform.OS === "web" && !navigator.share) {
      setStringAsync(`https://dys.us.to/${params.entity}`);
      Toast.show({ type: "info", text1: "Copied link to clipboard!" });
    } else
      shareAsync(`https://dys.us.to/${params.entity}`, {
        dialogTitle: "Share Dysperse Task",
        UTI: "public.plain-text",
        mimeType: "text/plain",
      });
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
          style={{ marginVertical: "auto" }}
          title="This link might be broken, or you may not have access…"
          subtitle="We searched the whole galaxy but couldn't find the item you're looking for."
        />
      </View>
    </ColorThemeProvider>
  );
};

export default function Page() {
  const insets = useSafeAreaInsets();
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
        <Toast topOffset={insets.top + 15} config={toastConfig(theme)} />
      </ColorThemeProvider>
    </PublishedEntityContext.Provider>
  );
}

