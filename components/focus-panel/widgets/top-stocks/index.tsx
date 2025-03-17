import { ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
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
          paddingVertical: 20,
          flex: 1,
          paddingHorizontal: 20,
          alignItems: "center",
        },
      ]}
      onPress={() => {
        Linking.openURL(
          `https://www.google.com/search?q=${stock.ticker}+stock`
        );
      }}
    >
      <Image
        source={{
          uri: `https://companiesmarketcap.com/img/company-logos/64/${stock.ticker.replace(
            "GOOGL",
            "GOOG"
          )}.webp`,
        }}
        style={{ width: 24, height: 24, marginBottom: 10 }}
      />
      <ButtonText weight={900}>{stock.ticker}</ButtonText>
      <ButtonText numberOfLines={1} weight={200} style={{ fontSize: 12 }}>
        {stock.name}
      </ButtonText>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 10,
        }}
      >
        <StockChange number={stock.today} />
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

  const [currentPage, setCurrentPage] = useState(0);
  const PER_PAGE = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((currentPage) => (currentPage + 1) % PER_PAGE);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
            width: "100%",
            flexDirection: "row",
          }}
        >
          {data &&
            data
              .slice(currentPage * PER_PAGE, currentPage * PER_PAGE + PER_PAGE)
              ?.map((stock) => (
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

