import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
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

export function WidgetMenu({ widgets, setWidgets }) {
  const theme = useColorTheme();
  const { setFocus } = useFocusPanelContext();

  const handleWidgetToggle = (widget: Widget) => {
    setWidgets((widgets) => {
      if (widgets.includes(widget)) {
        return widgets.filter((w) => w !== widget);
      } else {
        return [...widgets, widget];
      }
    });
  };

  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.menu,
        {
          paddingTop: 10 + insets.top,
        },
        !breakpoints.md && {
          borderBottomWidth: 1,
          borderBottomColor: theme[3],
        },
      ]}
    >
      {process.env.NODE_ENV === "production" && <WakeLock />}
      {!breakpoints.md && (
        <>
          <IconButton
            onPress={() => setFocus(false)}
            variant={breakpoints.md ? "filled" : "text"}
            style={{
              width: 60,
              opacity: 0.6,
            }}
          >
            <Icon>west</Icon>
          </IconButton>
          <Text
            style={{
              color: theme[11],
              marginLeft: "auto",
              marginRight: "auto",
              opacity: 0.7,
              fontSize: 20,
            }}
            weight={200}
          >
            Focus
          </Text>
        </>
      )}
      <MenuPopover
        containerStyle={{ marginLeft: -15 }}
        trigger={
          <IconButton variant="filled" style={{ width: 60 }}>
            <Icon>edit</Icon>
          </IconButton>
        }
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
                {widgets.includes("upcoming") && (
                  <Icon style={{ marginLeft: "auto" }}>check</Icon>
                )}
              </MenuItem>
            ),
          },
          { text: "Clock", icon: "timer" },
          { text: "Weather", icon: "wb_sunny" },
          { text: "Assistant", icon: "auto_awesome" },
          { text: "Music", icon: "music_note" },
        ].map((i) => ({
          ...i,
          selected: widgets.includes(i.text.toLowerCase()),
          callback: () => handleWidgetToggle((i.text as any).toLowerCase()),
        }))}
      />
    </View>
  );
}
