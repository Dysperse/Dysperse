import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import useSWR from "swr";
import { useFocusPanelContext } from "../../context";
import { widgetMenuStyles } from "../../widgetMenuStyles";

function formatNumber(num, d) {
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
        {number}%
      </Text>
    </Pressable>
  );
}

export function StockItem({
  large,
  stock,
  navigation,
}: {
  large?: boolean;
  stock: any;
  navigation;
}) {
  const theme = useColorTheme();
  const { panelState, setPanelState, collapseOnBack } = useFocusPanelContext();

  return (
    <Pressable
      key={stock.ticker}
      style={[
        {
          flexDirection: large || panelState === "COLLAPSED" ? "column" : "row",
          padding: 10,
          flex: 1,
          gap: 10,
          alignItems: large ? undefined : "center",
          borderBottomColor: theme[5],
          width: large ? "100%" : panelState === "COLLAPSED" ? 80 : 280,
        },
        large && {
          borderRadius: 20,
          marginBottom: 10,
          padding: 20,
          paddingVertical: 10,
          backgroundColor: theme[3],
        },
      ]}
      onPress={() => {
        if (panelState === "COLLAPSED") {
          navigation.push("Stocks");
          setPanelState("OPEN");
          if (panelState === "COLLAPSED") collapseOnBack.current = true;
        } else {
          Linking.openURL(
            `https://www.google.com/search?q=${stock.ticker}+stock`
          );
        }
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 20, flex: 1 }}
      >
        {panelState !== "COLLAPSED" && (
          <Image
            source={{
              uri: `https://companiesmarketcap.com/img/company-logos/64/${stock.ticker.replace(
                "GOOGL",
                "GOOG"
              )}.webp`,
            }}
            style={{ width: 24, height: 24 }}
          />
        )}
        <View style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
          {large && (
            <ButtonText numberOfLines={1} weight={900}>
              {stock.name}
            </ButtonText>
          )}
          <ButtonText>{stock.ticker}</ButtonText>
        </View>
        {panelState !== "COLLAPSED" && (
          <ButtonText
            style={{ marginLeft: "auto", opacity: 0.6, flexShrink: 0 }}
          >
            ${formatNumber(stock.currentPrice, 1)}
          </ButtonText>
        )}
      </View>
      {large && (
        <Text style={{ color: theme[11], opacity: 0.5 }} weight={600}>
          Market cap: ${formatNumber(stock.marketCap, 2)}
        </Text>
      )}
      {large && (
        <Text
          style={{ color: theme[11], opacity: 0.5, marginTop: -7 }}
          weight={600}
        >
          Volume (24H): {formatNumber(stock.volume24h, 2)}
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

export default function Widget({ navigation, menuActions, widget }) {
  const theme = useColorTheme();
  const { panelState } = useFocusPanelContext();
  const { data, error } = useSWR(
    "https://bubble-screener-api.neil-dahiya.workers.dev/api",
    (url) => fetch(url).then((res) => res.json())
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const sortedData = data.sort((a, b) => b.marketCap - a.marketCap);
      setCurrentIndex(0); // Reset index on data fetch

      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 2) % sortedData.length);
      }, 7000);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [data]);

  if (error) {
    return <ErrorAlert />;
  }

  const displayedStocks = data?.slice(currentIndex, currentIndex + 2) || [];

  return (
    <View>
      {panelState !== "COLLAPSED" && (
        <MenuPopover
          options={menuActions}
          trigger={
            <Button style={widgetMenuStyles.button} dense>
              <ButtonText weight={800} style={widgetMenuStyles.text}>
                Top stocks
              </ButtonText>
              <Icon style={{ color: theme[11] }}>expand_more</Icon>
            </Button>
          }
        />
      )}
      <Pressable
        style={{
          backgroundColor: theme[3],
          borderRadius: 20,
        }}
      >
        <View
          style={{
            height: panelState === "COLLAPSED" ? 120 : 100,
            overflow: "hidden",
          }}
        >
          {displayedStocks.map((stock) => (
            <Animated.View
              key={stock.ticker}
              entering={FadeIn}
              exiting={FadeOut}
            >
              <StockItem
                stock={stock}
                large={panelState !== "COLLAPSED"}
                navigation={navigation}
              />
            </Animated.View>
          ))}
        </View>
        {panelState !== "COLLAPSED" && (
          <View
            style={{
              padding: 10,
              paddingTop: 0,
            }}
          >
            <Button
              style={{ borderRadius: 0 }}
              variant="outlined"
              height={40}
              onPress={() => {
                navigation.navigate("Stocks");
              }}
            >
              <ButtonText>View more</ButtonText>
              <Icon>arrow_forward_ios</Icon>
            </Button>
          </View>
        )}
      </Pressable>
    </View>
  );
}
