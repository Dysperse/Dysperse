import { ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { Image } from "expo-image";
import { Linking, Pressable, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import useSWR from "swr";

function formatNumber(num) {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(parseInt(num));
}

function StockChange({ subtle, number }: { subtle?: boolean; number: number }) {
  const red = useColor("red");
  const green = useColor("green");

  return (
    <Pressable
      style={{
        backgroundColor: subtle ? undefined : number > 0 ? green[9] : red[9],
        borderRadius: 5,
        width: 60,
        paddingRight: 5,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: subtle ? "flex-end" : "center",
      }}
    >
      <Icon
        style={{
          color: number > 0 ? green[subtle ? 9 : 5] : red[subtle ? 9 : 5],
        }}
      >
        {number > 0 ? "arrow_drop_up" : "arrow_drop_down"}
      </Icon>
      <Text
        variant="eyebrow"
        style={{
          fontSize: 11,
          textAlign: subtle ? "right" : "center",
          fontFamily: "mono",
          color: number > 0 ? green[subtle ? 9 : 5] : red[subtle ? 9 : 5],
          opacity: 1,
        }}
      >
        {Math.abs(number)}%
      </Text>
    </Pressable>
  );
}

export function StockItem({ large, stock }: { large?: boolean; stock: any }) {
  const theme = useColorTheme();

  return (
    <Pressable
      key={stock.ticker}
      style={[
        {
          borderRadius: 20,
          marginBottom: 10,
          padding: 20,
          paddingVertical: 10,
          backgroundColor: theme[3],
        },
      ]}
      onPress={() => {
        Linking.openURL(
          `https://www.google.com/search?q=${stock.ticker}+stock`
        );
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 20, flex: 1 }}
      >
        <Image
          source={{
            uri: `https://companiesmarketcap.com/img/company-logos/64/${stock.ticker.replace(
              "GOOGL",
              "GOOG"
            )}.webp`,
          }}
          style={{ width: 24, height: 24 }}
        />
        <View style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
          {large && (
            <ButtonText numberOfLines={1} weight={900}>
              {stock.name}
            </ButtonText>
          )}
          <ButtonText style={{ width: "100%", height: 20 }}>
            {stock.ticker}
          </ButtonText>
        </View>
        <ButtonText style={{ marginLeft: "auto", opacity: 0.6, flexShrink: 0 }}>
          ${formatNumber(stock.currentPrice)}
        </ButtonText>
      </View>
      {large && (
        <Text style={{ color: theme[11], opacity: 0.5 }} weight={600}>
          Market cap: ${formatNumber(stock.marketCap)}
        </Text>
      )}
      {large && (
        <Text
          style={{ color: theme[11], opacity: 0.5, marginTop: -7 }}
          weight={600}
        >
          Volume (24H): {formatNumber(stock.volume24h)}
        </Text>
      )}
      {large && (
        <Text
          style={{ color: theme[11], opacity: 0.5, marginTop: -7 }}
          weight={600}
        >
          Previous Close: ${(stock.prev, 2)}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        {large ? (
          <View style={{ width: large ? "100%" : undefined }}>
            {["5min", "today", "week", "month", "year"].map((key) => (
              <View
                key={key}
                style={{
                  flexDirection: "row",
                  gap: 5,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 12, color: theme[11], flex: 1 }}>
                  {capitalizeFirstLetter(key.replace("5", "5 "))}
                </Text>
                <StockChange subtle key={key} number={stock[key]} />
              </View>
            ))}
          </View>
        ) : (
          <StockChange number={stock.today} />
        )}
      </View>
    </Pressable>
  );
}

export default function Widget({ navigation, widget }) {
  const theme = useColorTheme();
  const { data, error } = useSWR(
    "https://bubble-screener-api.neil-dahiya.workers.dev/api",
    (url) => fetch(url).then((res) => res.json())
  );

  if (error) {
    return <ErrorAlert />;
  }

  return (
    <View>
      <Text variant="eyebrow" style={{ marginBottom: 7 }}>
        Top stocks
      </Text>
      <Pressable
        style={{
          backgroundColor: theme[2],
          borderWidth: 1,
          borderColor: theme[5],
          borderRadius: 20,
        }}
      >
        <View
          style={{
            height: 120,
            width: "100%",
          }}
        >
          {data?.map((stock) => (
              <Animated.View
                key={stock.ticker}
                entering={FadeInRight}
                exiting={FadeOutLeft}
                style={{ flex: 1 }}
              >
                <StockItem
                  widget={widget}
                  key={stock.ticker}
                  stock={stock}
                  navigation={navigation}
                />
              </Animated.View>
            ))}
        </View>
      </Pressable>
    </View>
  );
}

