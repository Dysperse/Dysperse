import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useGlobalSearchParams } from "expo-router";
import { createContext, memo, useContext, useEffect, useRef } from "react";
import { Platform, StyleSheet, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";

interface ContentWrapperProps extends ViewProps {
  enabled?: boolean;
  noPaddingTop?: boolean;
}

const ContentWrapperContext = createContext({
  width: 0,
  height: 0,
});

export const useContentWrapperContext = () => useContext(ContentWrapperContext);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
});
function ContentWrapper(props: ContentWrapperProps) {
  const { sessionToken } = useUser();
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  const widthRef = useRef(0);
  const heightRef = useRef(0);

  const params = useGlobalSearchParams();
  const { mutate } = useSWR(["user/tabs"]);

  useEffect(() => {
    if (params.tab) {
      mutate(
        (oldData) =>
          oldData.map((oldTab) =>
            oldTab.id === params.tab
              ? { ...oldTab, params: omit(["tab", "params", "screen"], params) }
              : oldTab
          ),
        {
          revalidate: false,
        }
      );
      sendApiRequest(
        sessionToken,
        "PUT",
        "user/tabs",
        {},
        {
          body: JSON.stringify({
            params: omit(["tab", "fullscreen"], params),
            id: params.tab,
          }),
        }
      );
    }
  }, [sessionToken, mutate, params]);

  return props.enabled !== false ? (
    <ContentWrapperContext.Provider
      value={{ width: widthRef.current, height: heightRef.current }}
    >
      <View
        {...props}
        onLayout={(event) => {
          widthRef.current = event.nativeEvent.layout.width;
          heightRef.current = event.nativeEvent.layout.height;
        }}
        style={[
          {
            borderRadius: breakpoints.md ? 20 : 0,
            marginTop: props.noPaddingTop
              ? 0
              : breakpoints.md
              ? insets.top
              : insets.top + 64,
            backgroundColor: theme[1],
            borderWidth: breakpoints.md ? 2 : 0,
            borderColor: theme[5],
          },
          styles.container,
          Platform.OS === "web" && ({ WebkitAppRegion: "no-drag" } as any),
          props.style,
          Platform.OS === "web" && {
            maxHeight: `calc(calc(100vh - env(titlebar-area-height, 0)) - 20px)`,
          },
        ]}
      >
        {props.children}
      </View>
    </ContentWrapperContext.Provider>
  ) : (
    props.children
  );
}

export default memo(ContentWrapper);

