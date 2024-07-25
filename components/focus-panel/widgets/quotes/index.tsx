import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text, { getFontName } from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useFocusPanelContext } from "../../context";
import { widgetMenuStyles } from "../../widgetMenuStyles";
import { widgetStyles } from "../../widgetStyles";

export default function Quotes({ widget, menuActions }) {
  const { data, mutate, error } = useSWR(
    [
      ``,
      {
        tags: "famous-quotes|success|failure|ethics|health|honor|leadership|power-quotes|work",
      },
      "https://api.quotable.io/random",
    ],
    null,
    {
      refreshInterval: 1000 * 60 * 60,
    }
  );

  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = () => {
    if (!refreshed) {
      setRefreshed(true);
      Toast.show({ type: "info", text1: "Quotes refresh every hour" });
    }
    mutate();
  };

  const theme = useColorTheme();
  const { panelState, setPanelState } = useFocusPanelContext();

  return panelState === "COLLAPSED" ? (
    <IconButton
      variant="outlined"
      size={80}
      style={{ borderRadius: 20 }}
      backgroundColors={{
        default: theme[3],
        pressed: theme[4],
        hovered: theme[5],
      }}
      onPress={() => setPanelState("OPEN")}
      icon="format_quote"
    />
  ) : (
    <View>
      <MenuPopover
        options={[
          {
            text: "Refresh",
            icon: "refresh",
            callback: handleRefresh,
          },
          { divider: true },
          ...menuActions,
        ]}
        containerStyle={{ marginTop: -15 }}
        trigger={
          <Button style={widgetMenuStyles.button} dense>
            <ButtonText weight={800} style={widgetMenuStyles.text}>
              Quotes
            </ButtonText>
            <Icon style={{ color: theme[11] }}>expand_more</Icon>
          </Button>
        }
      />
      {error && <ErrorAlert />}
      <View
        style={[
          widgetStyles.card,
          {
            backgroundColor: theme[3],
            borderWidth: 1,
            borderColor: theme[6],
          },
        ]}
      >
        {data ? (
          <>
            <Text
              style={{
                fontSize: data.content.length > 100 ? 23 : 28,
                fontFamily: getFontName("crimsonPro", 800),
              }}
            >
              &ldquo;{data?.content}&rdquo;
            </Text>
            <Text style={{ marginTop: 10, opacity: 0.6 }} weight={400}>
              &mdash; {data?.author}
            </Text>
          </>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 70 }}>
            <Spinner />
          </View>
        )}
      </View>
    </View>
  );
}
