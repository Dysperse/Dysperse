import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuOption } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { showErrorToast } from "@/utils/errorToast";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import useSWR from "swr";

export type Widget =
  | "upcoming"
  | "weather"
  | "clock"
  | "music"
  | "quotes"
  | "word of the day";

export const Navbar = ({
  title,
  backgroundColor,
  foregroundColor,
  widgetId,
  options = [],
  bgcolors,
}: {
  title: string;
  backgroundColor?: string;
  foregroundColor?: string;
  widgetId?: string;
  options?: MenuOption[];
  bgcolors?: any;
}) => {
  const navigation = useNavigation();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const isDark = useDarkMode();

  const { mutate } = useSWR(["user/focus-panel"], null);
  const { sessionToken } = useUser();

  const handleDelete = async () => {
    try {
      mutate((oldData) => oldData.filter((w) => w.id !== widgetId));
      sendApiRequest(sessionToken, "DELETE", "user/focus-panel", {
        id: widgetId,
      });
    } catch (e) {
      showErrorToast();
    }
  };

  const backgroundColors =
    typeof bgcolors === "undefined"
      ? bgcolors
      : title === "Focus"
      ? undefined
      : {
          default: "transparent",
          pressed: isDark ? "rgba(255,255,255,.1)" : "rgba(0, 0, 0, 0.1)",
          hovered: isDark ? "rgba(255,255,255,.2)" : "rgba(0, 0, 0, 0.2)",
        };

  return (
    <View
      style={{
        height: 70,
        flexDirection: title === "Focus" ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        backgroundColor: backgroundColor || theme[2],
      }}
    >
      <IconButton
        onPress={() => {
          if (title === "Focus") {
            navigation.push("New");
          } else {
            navigation.goBack();
          }
        }}
        backgroundColors={backgroundColors}
        variant={
          title === "Focus" ? (breakpoints.md ? "filled" : "text") : "text"
        }
        iconProps={{ bold: true }}
        icon="west"
      />
      <Text
        style={{
          opacity: title === "Focus" ? 0 : 1,
          color: foregroundColor || theme[11],
          marginHorizontal: "auto",
          paddingRight: widgetId ? null : 30,
        }}
        weight={800}
      >
        {title}
      </Text>
      {widgetId && (
        <MenuPopover
          menuProps={{ rendererProps: { placement: "bottom" } }}
          containerStyle={{ marginLeft: -10 }}
          trigger={
            <IconButton
              backgroundColors={backgroundColors}
              icon="more_horiz"
              iconProps={{ bold: true }}
            />
          }
          options={[
            ...options,
            {
              icon: "remove_circle",
              text: "Remove widget",
              callback: handleDelete,
            },
          ]}
        />
      )}
    </View>
  );
};

