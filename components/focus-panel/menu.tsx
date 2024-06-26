import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LexoRank } from "lexorank";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useFocusPanelContext } from "./context";
import { WakeLock, Widget } from "./panel";

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});

export function WidgetMenu() {
  const theme = useColorTheme();
  const { setFocus } = useFocusPanelContext();
  const { sessionToken } = useUser();

  const { data, mutate } = useSWR(["user/focus-panel"]);
  const [loading, setLoading] = useState(true);

  const handleWidgetToggle = async (type: Widget) => {
    try {
      setLoading(true);
      await sendApiRequest(
        sessionToken,
        "POST",
        "user/focus-panel",
        {},
        {
          body: JSON.stringify({
            type,
            order: data[0]
              ? LexoRank.parse(data[0].order).genPrev().toString()
              : LexoRank.middle().toString(),
            params: {},
          }),
        }
      );
      mutate();
    } catch (e) {
      Toast.show({
        text1: "Something went wrong. Please try again later",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (data) {
      setLoading(false);
    }
  }, [data]);

  return !data ? null : (
    <View
      style={[
        styles.menu,
        {
          paddingTop: 10 + insets.top,
        },
        !breakpoints.md && {
          borderRadius: 999,
          gap: 5,
          marginTop: 10,
          paddingHorizontal: 20,
          paddingRight: 10,
        },
      ]}
    >
      {process.env.NODE_ENV === "production" && <WakeLock />}
      {!breakpoints.md && (
        <>
          <Text
            weight={900}
            style={{ marginRight: "auto", opacity: 0.6, color: theme[12] }}
          >
            Focus
          </Text>
          <IconButton
            onPress={() => setFocus(false)}
            variant={breakpoints.md ? "filled" : "text"}
            style={{ opacity: 0.6 }}
            size={40}
          >
            <Icon style={{ color: theme[12] }}>stop_circle</Icon>
          </IconButton>
        </>
      )}
      <MenuPopover
        trigger={
          <IconButton
            variant={breakpoints.md ? "filled" : "text"}
            style={{
              width: breakpoints.md ? 60 : undefined,
              opacity: breakpoints.md ? undefined : 0.6,
            }}
            size={breakpoints.md ? undefined : 40}
            disabled={loading}
          >
            {loading ? <Spinner /> : <Icon>add</Icon>}
          </IconButton>
        }
        containerStyle={{ marginLeft: -20 }}
        closeOnSelect
        options={[
          {
            text: "Upcoming",
            renderer: () => (
              <MenuItem onPress={() => handleWidgetToggle("upcoming")}>
                <Svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  width={24}
                  height={24}
                  stroke={theme[11]}
                >
                  <Path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
                  />
                </Svg>
                <Text variant="menuItem">Up next</Text>
              </MenuItem>
            ),
          },
          { text: "Quotes", icon: "format_quote" },
          { text: "Clock", icon: "timer" },
          { text: "Weather", icon: "wb_sunny" },
          { text: "Assistant", icon: "auto_awesome" },
          { text: "Sports", icon: "sports_football" },
        ].map((i) => ({
          ...i,
          callback: () => handleWidgetToggle(i.text.toLowerCase() as Widget),
        }))}
      />
    </View>
  );
}
