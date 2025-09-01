import { Button } from "@/ui/Button";
import DropdownMenu from "@/ui/DropdownMenu";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text, { getFontName } from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useState } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";
import useSWR from "swr";
import { widgetStyles } from "../../widgetStyles";

export default function Quotes() {
  const { data, mutate, error } = useSWR(
    ["", {}, "https://quotes-api-self.vercel.app/quote"],
    null,
    {
      refreshInterval: 1000 * 60 * 60,
      revalidateOnFocus: false,
    }
  );

  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = () => {
    if (!refreshed) {
      setRefreshed(true);
      toast.info("Quotes refresh every hour");
    }
    mutate();
  };

  const theme = useColorTheme();

  return (
    <View>
      <DropdownMenu
        options={[
          {
            text: "Refresh",
            icon: "refresh",
            onPress: handleRefresh,
          },
        ]}
      >
        <Button
          dense
          containerStyle={{
            marginRight: "auto",
            marginBottom: 6,
            marginLeft: -10,
          }}
        >
          <Text variant="eyebrow">Quotes</Text>
          <Icon style={{ color: theme[11], opacity: 0.6 }}>expand_more</Icon>
        </Button>
      </DropdownMenu>
      {error && <ErrorAlert />}
      <View
        style={[
          widgetStyles.card,
          { backgroundColor: theme[2], borderColor: theme[5], borderWidth: 1 },
        ]}
      >
        {data ? (
          <>
            <Text
              style={{
                fontSize: 23,
                color: theme[11],
                fontFamily: getFontName("crimsonPro", 800),
              }}
            >
              &ldquo;{data?.quote}&rdquo;
            </Text>
            <Text
              style={{ marginTop: 10, opacity: 0.6, color: theme[11] }}
              weight={400}
            >
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

